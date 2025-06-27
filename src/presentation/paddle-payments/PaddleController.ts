import { Request, Response } from "express";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

import axios from "axios";
import { envs } from "../../config/envs.js";
import { Prisma, PrismaClient } from "@prisma/client";



export class PaddleController {

  constructor() {
  }

  static async PaddleWebhook(req: Request, res: Response) {


    const prisma = new PrismaClient();
    //!! Endpoints for paddle must return 200 bafore processing the request
    //!! This is a requirement from Paddle to avoid retries
    res.status(200).send("Webhook received");





    switch (req.body.event_type) {
      case "customer.created":
        const customer_id = req.body.data.id;

        console.log("Customer created with ID:", customer_id);
        const { name, email } = req.body.data;
        //busca el usuario por email
        let user = await prisma.users.findFirst({
          where: {
            email: email,
          }
        })
        if (!user) {
          user = await prisma.users.create({
            data: {
              name,
              email,
              paddle_customer_id: customer_id
            }
          });
        }
        else {
          await prisma.users.update({
            where: {
              id: user.id
            },
            data: {
              paddle_customer_id: customer_id,
            }
          })
        }
        break;
      case "transaction.paid":
        {



          const transaction_id = req.body.data.id;
          const paid_at = req.body.data.billed_at;
          const { customer_id, status } = req.body.data;
          const { grand_total, currency_code } = req.body.data.details.totals;

          //obtenemos los datos del metodo de pago
          const payments = req.body.data.payments || [];
          const capturedPayment = payments.find((payment: any) => payment.status === "captured");
          console.log("Captured Payment:", capturedPayment);
          const payment_method = capturedPayment.method_details?.type || "unknown";

          const payment_method_brand = capturedPayment.method_details?.card.type || "unknown";
          const last4 = capturedPayment.method_details?.card.last4 || "0000";

          let user = await prisma.users.findFirst({
            where: {
              paddle_customer_id: customer_id
            }
          });
          console.log("Transaction ID:", transaction_id);
          console.log("Paid At:", paid_at);
          console.log("Customer ID:", customer_id);
          console.log("Status:", status);
          console.log("Grand Total:", grand_total);
          console.log("Currency:", currency_code);
          console.log("Payment Method:", payment_method);
          console.log("Payment Method Brand:", payment_method_brand);
          console.log("Last 4 Digits:", last4);


          const transaction = await prisma.transactions.create({
            data: {
              user_id: user ? user.id : null,
              paddle_transaction_id: transaction_id,
              amount: grand_total,
              currency: currency_code,
              status,
              paid_at,
              payment_method,
              brand: payment_method_brand,
              last4,
            }
          })
          console.log("Transaction created:", transaction);

        }
        break;
      case "subscription.activated":
        {
          console.log(req.body);
          const { customer_id, status, next_billed_at, paused_at, canceled_at, created_at, updated_at } = req.body.data;
          const { starts_at, ends_at } = req.body.data.current_billing_period;
          const paddle_subscription_id = req.body.data.id;
          const plan = req.body.data.items[0].price.name;



          let user = await prisma.users.findFirst({
            where: {
              paddle_customer_id: customer_id
            }
          });
          if (user) {

            console.log("User found:", user);
            const subscription = await prisma.subscriptions.create({
              data: {
                paddle_customer_id: customer_id,
                user_id: user ? user.id : null,
                paddle_subscription_id,
                status,
                plan,
                next_bill_date: next_billed_at,
                paused_at,
                canceled_at,
                created_at,
                updated_at,
                current_billing_period_start: starts_at,
                current_billing_period_end: ends_at,
              }
            })


            //add the subscription_id to the transaction made before
            console.log("subscription id created:", subscription.id);
            const transaction = await prisma.transactions.updateMany({
              where: {
                user_id: user.id,
                status: "paid",
                subscription_id: null, // Ensure we only update transactions without a subscription ID
              },
              data: {
                subscription_id: subscription.id,
              }
            })
            console.log("Customer ID:", customer_id);
            console.log("Status:", status);
            console.log("Next Billed At:", next_billed_at);
            console.log("Paused At:", paused_at);
            console.log("Canceled At:", canceled_at);
            console.log("Created At:", created_at);
            console.log("Updated At:", updated_at);
            console.log("Starts At:", starts_at);
            console.log("Ends At:", ends_at);
            console.log("Paddle Subscription ID:", paddle_subscription_id);
            console.log("Plan:", plan);

          }
          else {
            console.log("User not found for customer ID:", customer_id);
          }

        }
        break;
    }

  }
}
