'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Faq() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Instant Offer Furniture — Sourcing Manual</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">20% Profit • No Risk • Unlimited Upside</CardTitle>
        </CardHeader>
        <CardContent>
          <p>As a certified IOF Sourcer, your role is simple:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Find high-quality couch deals</li>
            <li>Negotiate price with sellers</li>
            <li>Submit strong leads through the app</li>
            <li>Earn 20% of profit once items sell</li>
          </ul>
          <p>We handle pickup, cleaning, listings, sales, and payouts — you focus only on finding great deals and locking them in.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">How to Use the Sourcing App</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li className="mb-8">
              <strong>Submit a Lead:</strong> Use the “Submit a Lead” form and provide as much detail as possible:
              <ul className="list-disc list-inside ml-6 space-y-2 mt-2">
                <li>Identify the brand</li>
                <li>Find the original retail price</li>
                <li>Attach screenshots/photos from the listing</li>
                <li>Enter the seller’s asking or agreed purchase price</li>
                <li>Include the seller’s address and phone number</li>
                <li>Select available pickup dates</li>
              </ul>
            </li>
            <li className="mb-8">
              <strong>AI Screening:</strong> After submission, your lead runs through our AI screening system, which provides a quick snapshot:
              <ul className="list-disc list-inside ml-6 space-y-2 my-2">
                <li>Likely accepted</li>
                <li> Borderline</li>
                <li>Unlikely approved</li>
              </ul>
              <p>This does not guarantee approval — all final decisions are still made by our team.</p>
            </li>
            <li>
              <strong>Approval & Fulfillment:</strong> When approved:
              <ul className="list-disc list-inside ml-6 space-y-2 my-2">
                <li>Our team schedules pickup</li>
                <li>Dispatches the movers</li>
                <li>Handles seller payment</li>
                <li>Cleans, stages, and lists the item</li>
              </ul>
              <p>Your sourcing role ends once the item is approved.</p>
            </li>
            <li>
              <strong>Get Paid:</strong>
              <ul className="list-disc list-inside ml-6 space-y-2 my-2">
                <li>You recieve a 20% commission once the item sells from the IOF storefront</li>
                <li>Set up and recieve payouts via Stripe on the Profile page</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Key Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>Focus on quality, clean, resale-friendly couches</li>
            <li>Research retail pricing before submitting</li>
            <li>Avoid damaged or low-end furniture</li>
            <li>Leads are private to you</li>
            <li>There is no cap on earnings</li>
          </ul>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="seller-messaging">
          <AccordionTrigger>Seller Messaging Script</AccordionTrigger>
          <AccordionContent>
            <p>Follow this structure for your conversations:</p>
            <p><strong>Example – $300 Sectional</strong></p>
            <p><strong>Message 1:</strong> Hi! Is this still available? Can you do $200? I can pick up [insert available date]</p>
            <p><strong>Customer Response:</strong> Can you meet me at $250? What time on [insert date] can you pick up?</p>
            <p><strong>Message 2:</strong> I can pick up [insert available date/time based on our pickup availability].</p>
            <p>Continue conversation until price and pickup timing are agreed</p>
            <p><strong>Lock-In Message:</strong> Perfect — I’ll be sending movers to collect this. Could I get your phone number so they can contact you when they’re on the way?</p>
            <p>Submit a lead via the <a href="/submit-lead">Submit a Lead form</a></p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="payment-questions">
          <AccordionTrigger>Payment Questions</AccordionTrigger>
          <AccordionContent>
            <p>If asked:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Venmo is preferred</li>
              <li>PayPal, CashApp, and Apple Pay are also supported</li>
              <li>Customers are paid on location when movers arrive</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="getting-paid">
          <AccordionTrigger>Getting Paid</AccordionTrigger>
          <AccordionContent>
            <p>Connect your bank account inside “My Profile” via Stripe</p>
            <p>When your sourced couch sells, your 20% profit cut immediately becomes available</p>
            <p>Instant cash-out directly to your bank</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="stripe-onboarding">
          <AccordionTrigger>Stripe Onboarding Steps</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Add phone/email info</li>
              <li>Select "Individual" for Business type</li>
              <Image
                src="/images/stripe-onboarding.png"
                alt="Stripe onboarding instructions"
                width={564}
                height={291}
                className="rounded-md mb-2"
                />
              <li>Rather than adding a website, choose to add a product description such as "Sourcing furniture leads for furniture companies"</li>
              <li>Connect your bank account</li>
              <li>Get paid!</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="success-tips">
          <AccordionTrigger>Sourcing Success Tips</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Target known mid-high-end brands (West Elm, CB2, Crate & Barrel, etc.)</li>
              <li>Focus on quality items in clean condition</li>
              <li>Avoid damaged or low-end furniture</li>
              <li>Always research retail values before submitting</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="what-gets-rejected">
          <AccordionTrigger>What Gets Rejected</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Low resale brands (IKEA, Amazon, Wayfair, etc.)</li>
              <li>Recliners or oversized specialty seating</li>
              <li>Dirty, damaged, or heavily worn couches</li>
              <li>Remote locations that don’t fit route logistics</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="expansion-future">
          <AccordionTrigger>National Expansion</AccordionTrigger>
          <AccordionContent>
            <p>We’re actively rolling out the sourcing platform to cities nationwide.</p>
            <p>Soon you’ll be sourcing couches across 15+ metro markets, unlocking far more volume and far more earning potential.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>Support & Helpline</AccordionTrigger>
          <AccordionContent>
            <p>If you run into any issues, need deal guidance, or have questions while sourcing, reach our team directly:</p>
            <p><strong>Text our Helpline: 720-541-9963</strong></p>
            <p>Fastest support for:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Lead questions or deal approvals</li>
              <li>Pickup coordination issues</li>
              <li>App or payout troubleshooting</li>
              <li>Seller communication support</li>
            </ul>
            <p>We're here to help you close deals and earn faster.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Final Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Your leads remain private to you</li>
            <li>All approvals are reviewed manually</li>
            <li>There’s no limit to how much you can earn</li>
          </ul>
          <p>Consistent sourcing = consistent commissions.</p>
          <p><strong>Happy sourcing.</strong></p>
        </CardContent>
      </Card>
    </div>
  );
}