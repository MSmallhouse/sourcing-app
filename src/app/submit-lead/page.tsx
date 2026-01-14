'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation'
import { PickupTimeSelect } from '@/components/PickupTimeSelect';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CONDITION_OPTIONS = ['Like New', 'Good', 'Fair'];

export default function SubmitLeadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [retailPrice, setretailPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [botResult, setBotResult] = useState<null | {
    accepted: boolean;
    resale_estimate: string;
    reasoning: string;
  }>(null);
  const [step, setStep] = useState<'review' | 'submit'>('review');
  const [loading, setLoading] = useState(false);

  const { userId } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadLeadImage(file: File, leadId: string) {
    const filePath = `leads/${leadId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('lead-images')
      .upload(filePath, file);
  
    if (error) throw error;
  
    const { data: urlData } = supabase.storage
      .from('lead-images')
      .getPublicUrl(filePath);
  
    return urlData.publicUrl;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupTime || !userId) return;

    if (step === 'review') {
      setLoading(true);
      // send lead to OpenAI for review
      const reviewRes = await fetch('api/quote-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          purchase_price: purchasePrice === '' ? 0 : Number(purchasePrice),
          retail_price: retailPrice === '' ? 0 : Number(retailPrice),
          condition: condition,
          notes,
        }),
      });
      const reviewJson = await reviewRes.json();
  
      let verdictObj = reviewJson.verdict;
      if (typeof verdictObj === 'string') {
        const fixedJson = verdictObj
          .replace(/\bTRUE\b/g, 'true')
          .replace(/\bFALSE\b/g, 'false');
        try {
          verdictObj = JSON.parse(fixedJson);
        } catch (err) {
          alert('Quote Enforcement Bot returned invalid JSON.');
          setLoading(false);
          return;
        }
      }
  
      setBotResult({
        accepted: verdictObj.accepted?? verdictObj.ACCEPTED,
        resale_estimate: verdictObj.resale_estimate|| verdictObj.RESALE_ESTIMATE,
        reasoning: verdictObj.reasoning || verdictObj.REASONING,
      });
      setStep('submit');
      setLoading(false);
      return;
    }
  
    // Insert the lead into Supabase
    const [startISO, endISO] = pickupTime.split('|');
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        sourcer_id: userId,
        title,
        purchase_price: purchasePrice === '' ? 0 : Number(purchasePrice),
        address,
        phone,
        notes,
        pickup_start: startISO,
        pickup_end: endISO,
        status: 'submitted',
      })
      .select()
      .single();
  
    if (error) {
      console.error('Error inserting lead:', error);
      return;
    }

    // Upload image
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadLeadImage(image, lead.id);
      await supabase
      .from('leads')
      .update({ image_url: imageUrl })
      .eq('id', lead.id);
    }

console.log('CC Emails:', process.env.NEXT_PUBLIC_CC_EMAILS?.split(',').map(email => email.trim()))
    // Send email notification to the admin
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_ADMIN_NOTIFICATIONS_EMAIL,
          cc: process.env.NEXT_PUBLIC_CC_EMAILS
            ? process.env.NEXT_PUBLIC_CC_EMAILS.split(',').map(email => email.trim())
            : [],
          subject: 'New Lead Submitted',
          html: `
            <h1>New Lead Submitted</h1>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Condition:</strong> ${condition}</p>
            <p><strong>Purchase Price:</strong> $${purchasePrice}</p>
            <p><strong>Retail Price:</strong> $${retailPrice}</p>
            <p><strong>Notes:</strong> ${notes}</p>
            ${
              imageUrl
                ? `<p><strong>Image:</strong></p><img src="${imageUrl}" alt="Lead Image" style="max-width: 100%; height: auto;" />`
                : '<p><strong>Image:</strong> No image uploaded.</p>'
            }
          `,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    // Clear the form fields
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImage(null);
    setPurchasePrice('');
    setretailPrice('');
    setCondition('');
    setAddress('');
    setPhone('');
    setNotes('');
    setPickupTime('');

    router.push('/dashboard');
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a Lead</h1>
      {botResult && step === 'submit' && (
        <div
          className={`p-4 mb-8 rounded text-white ${
            botResult.accepted ? 'bg-green-600' : 'bg-orange-600'
          }`}
        >
          <div className="font-bold text-lg">
            {botResult.accepted ? 'Accepted by Quote Bot' : 'Rejected by Quote Bot'}
          </div>
          <div className="mt-2">
            <span className="font-semibold">Estimated Resale Value:</span> {botResult.resale_estimate}
          </div>
          <div className="mt-1 italic">{botResult.reasoning}</div>
          {!botResult.accepted && (
            <div className="mt-4">You may still submit this lead if you believe it has sufficient resale value</div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className={`space-y-4 ${step === 'submit' ? 'hidden' : ''}`}>
          <Input
            placeholder="Title*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => setImage(e.target.files?.[0] || null)}
            required
          />
          <Button
          type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? "Change File" : "Image*"}
          </Button>
          <span className="ml-2 text-gray-600">
            {image ? image.name : "No file chosen"}
          </span>
          <Input
            placeholder="Purchase Price*"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={purchasePrice}
            onChange={e => {
              // Only allow number inputs
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setPurchasePrice(val);
              }
            }}
          />
          <Input
            placeholder="Approx. Original Retail Price*"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={retailPrice}
            onChange={e => {
              // Only allow number inputs
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setretailPrice(val);
              }
            }}
            required
          />
          <Select
            value={condition}
            onValueChange={value => setCondition(value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Condition*" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map(option => (
                <SelectItem value={option} key={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Address*"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Input
            placeholder="Phone Number*"
            type="tel"
            pattern="[\d\s\-\+\(\)]*"
            value={phone}
            onChange={e => {
              // Only allow digits, spaces, dashes, parentheses, and plus characters
              const val = e.target.value;
              if (/^[\d\s\-+()]*$/.test(val)) {
                setPhone(val);
              }
            }}
            maxLength={20}
          />
          <Textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <PickupTimeSelect
            value={pickupTime}
            onChange={setPickupTime}
          />
        </div>
        {step === 'submit' && (
          <Button
            className='me-2'
            variant="secondary"
            onClick={() => setStep('review')}
          >
            Back to Form
          </Button>
        )}
        <Button
          variant="outline"
          type="submit"
          disabled={loading}
        >
          {step === 'review'
            ? loading ? 'Reviewing...' : 'Submit for Quote Review'
            : 'Submit Lead'}
        </Button>
      </form>
    </div>
  );
}
