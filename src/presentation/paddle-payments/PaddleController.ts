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

    console.log("Received Paddle webhook:", req.body);




    switch (req.body.event_type) {
      case "customer.created":
        const customer_id = req.body.data.id;

        const { name, email } = req.body.data;
        //busca el usuario por email
        let user = await prisma.users.findFirst({
          where: {
            email: email,
          }
        })
        if (!user) {
          // user = await prisma.users.create({
          //   data: {
          //     name,
          //     email,
          //     paddle_customer_id: customer_id
          //   }
          // });
          console.log("User not found while creating customer")
        }
        else {
          //TODO: check if the customer already exists
          const customerExists = await prisma.customers.findFirst({
            where: {
              user_id: user.id,
            }
          })
          if (customerExists) {

            const updatedCustomer = await prisma.customers.update({
              data: {
                paddle_customer_id: customer_id,
              },
              where: {
                id: customerExists.id // If no customer exists with this user_id, it fails
              }
            })
          }
          else {
            const newCustomer = await prisma.customers.create({
              data: {
                user_id: user.id,
                paddle_customer_id: customer_id,
              }
            })
          }
        }
        break;
      case "transaction.paid":
        {



          const transaction_id = req.body.data.id;
          const paid_at = req.body.data.billed_at;
          const { status } = req.body.data;
          const paddle_customer_id = req.body.data.customer_id;
          const { grand_total, currency_code } = req.body.data.details.totals;

          //obtenemos los datos del metodo de pago
          const payments = req.body.data.payments || [];
          const capturedPayment = payments.find((payment: any) => payment.status === "captured");

          const payment_method = capturedPayment.method_details?.type || "unknown";

          const payment_method_brand = capturedPayment.method_details?.card.type || "unknown";
          const last4 = capturedPayment.method_details?.card.last4 || "0000";

          let customer = await prisma.customers.findFirst({
            where: {
              paddle_customer_id
            }
          });


          //TODO: check if the customer already exists
          const transaction = await prisma.transactions.create({
            data: {
              customer_id: customer?.id,
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


        }
        break;
      case "subscription.activated":
        {
          console.log(req.body);
          const { status, next_billed_at, paused_at, canceled_at, created_at, updated_at } = req.body.data;
          const paddle_customer_id = req.body.data.customer_id;
          const { starts_at, ends_at } = req.body.data.current_billing_period;
          const paddle_subscription_id = req.body.data.id;
          const plan = req.body.data.items[0].price.name;



          let customer = await prisma.customers.findFirst({
            where: {
              paddle_customer_id
            }
          });
          if (customer) {

            console.log("customer found:", customer);
            const subscriptionExists = await prisma.subscriptions.findFirst({
              where: {
                customer_id: customer.id,
              }
            })

            let subscription; //customers subscription
            //if the subscription already exists, we update it, otherwise we create a new one
            if (subscriptionExists) {
              subscription = await prisma.subscriptions.update({
                where: {
                  id: subscriptionExists.id,
                },
                data: {
                  customer_id: customer.id,
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

            }
            else {

              subscription = await prisma.subscriptions.create({
                data: {
                  customer_id: customer.id,
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
            }
            //add the subscription_id to the transaction made before
            console.log("subscription id created:", subscription.id);



            const transaction = await prisma.transactions.updateMany({
              where: {
                customer_id: customer.id,
                status: "paid",
                subscription_id: null, // Ensure we only update transactions without a subscription ID
              },
              data: {
                subscription_id: subscription.id,
              }
            })


          }
          else {
            console.log("User not found for customer ID:", customer_id);
          }


        }
        break;
      case "subscription.updated":
        {
          console.log("suscripcion renovada?")
          const paddle_subscription_id = req.body.data.id;
          const { updated_at, next_billed_at, paused_at, status } = req.body.data;
          //in case the billing period is null (when the subscription is paused)
          const current_billing_period = req.body.data.current_billing_period ?? { ends_at: null, starts_at: null };
          const { ends_at, starts_at } = current_billing_period;
          const plan = req.body.data.items[0].price.name;
          const subscription = await prisma.subscriptions.findFirst({
            where: {
              paddle_subscription_id
            }
          })

          if (!subscription) {
            console.log("Subscription not found for ID:", paddle_subscription_id);
            return;
          }
          console.log("Subscription updated values:");
          console.log("paddle_subscription_id:", paddle_subscription_id);
          console.log("updated_at:", updated_at);
          console.log("next_billed_at:", next_billed_at);
          console.log("paused_at:", paused_at);
          console.log("current_billing_period_start:", starts_at);
          console.log("current_billing_period_end:", ends_at);

          //set the subscription to pending before the transaction is paid
          const updatedSubscription = await prisma.subscriptions.update({
            where: {
              id: subscription.id,
            },
            data: {
              next_bill_date: next_billed_at,
              updated_at,
              status,
              paused_at,
              current_billing_period_start: starts_at,
              current_billing_period_end: ends_at,
              plan,
            }
          })
        }
        break;

      case "subscription.trialing":

        // This event is triggered when a subscription enters a trial period
        // This is useful for tracking when a user starts a trial period for a subscription
        //To know when to change the status to free, we'll need to check the subscription trialing ending date with a job or a cron job
        {
          console.log("suscripcion renovada?")
          const paddle_subscription_id = req.body.data.id;
          const { updated_at, next_billed_at, paused_at, status } = req.body.data;
          //in case the billing period is null (when the subscription is paused)
          const current_billing_period = req.body.data.current_billing_period ?? { ends_at: null, starts_at: null };
          const { ends_at, starts_at } = current_billing_period;
          const plan = req.body.data.items[0].price.name;



          const subscription = await prisma.subscriptions.findFirst({
            where: {
              paddle_subscription_id
            }
          })

          if (!subscription) {
            console.log("Subscription not found for ID:", paddle_subscription_id);
            return;
          }
          //set the subscription to pending before the transaction is paid
          const updatedSubscription = await prisma.subscriptions.update({
            where: {
              id: subscription.id,
            },
            data: {
              next_bill_date: next_billed_at,
              updated_at,
              status,
              paused_at,
              current_billing_period_start: starts_at,
              current_billing_period_end: ends_at,
              plan,
            }
          })
        }
        break;


    }

  }
}
