import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";



export class AuthController {
  private prismaClient = new PrismaClient();

  constructor() {
  }


  public signUp = async (req: Request, res: Response) => {
    try {
      console.log("=== DEBUG INFO ===");
      console.log("req.body:", req.body);
      console.log("typeof req.body:", typeof req.body);
      console.log("req.headers['content-type']:", req.headers['content-type']);
      console.log("==================");

      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({
          error: "Request body is required and must be valid JSON"
        });
        return;
      }

      if (!req.body.user_id) {
        res.status(400).json({
          error: "user_id field is required in request body",
          received_body: req.body
        });
        return;
      }

      const { user_id } = req.body;
      
      // Limpiar el user_id de espacios en blanco y caracteres especiales
      const cleanUserId = user_id ? user_id.toString().trim() : '';
      
      console.log("User ID from request body (raw):", JSON.stringify(user_id));
      console.log("User ID cleaned:", JSON.stringify(cleanUserId));
      console.log("User ID length:", cleanUserId.length);
      
      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(cleanUserId)) {
        res.status(400).json({
          error: "Invalid UUID format for user_id",
          received: cleanUserId,
          expected_format: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        });
        return;
      }

      //new customer for free default plan
      const newCustomer = await this.prismaClient.customers.create({
        data: {
          user_id: cleanUserId,
          paddle_customer_id: "not_created_yet"
          // Add other fields as necessary
        }
      });
      //TODO: validate that the customer was created successfully
      const newSubscription = await this.prismaClient.subscriptions.create({
        data: {
          status: "active",
          plan: "free",
          customer_id: newCustomer.id,
        }
      });

      res.status(201).json({
        message: "User signed up successfully",
        customer_id: newCustomer.id,
        subscription_id: newSubscription.id
      });

    } catch (error) {
      console.error("Error in signUp:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
