'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation'
import { PickupTimeSelect } from '@/components/PickupTimeSelect';
import { setRequestMeta } from 'next/dist/server/request-meta';
import { retail } from 'googleapis/build/src/apis/retail';

const CONDITION_OPTIONS = ['Like New', 'Good', 'Fair'];

export default function SubmitLeadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [projectedSalePrice, setProjectedSalePrice] = useState('');
  const [retailPrice, setretailPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [botResult, setBotResult] = useState<null | {
    is_below_high_end: boolean;
    resale_range: string;
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
        is_below_high_end: verdictObj.is_below_high_end ?? verdictObj.IS_BELOW_HIGH_END,
        resale_range: verdictObj.resale_range || verdictObj.RESALE_RANGE,
        reasoning: verdictObj.reasoning || verdictObj.REASONING,
      });
      setStep('submit');
      setLoading(false);
      return;
    }
  
    const [startISO, endISO] = pickupTime.split('|');
  
    // Insert the lead into Supabase
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        sourcer_id: userId,
        title,
        purchase_price: purchasePrice === '' ? 0 : Number(purchasePrice),
        projected_sale_price: projectedSalePrice === '' ? 0 : Number(projectedSalePrice),
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

    // Clear the form fields
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImage(null);
    setPurchasePrice('');
    setProjectedSalePrice('');
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
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          className="border p-2 w-full"
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
        <button
          type="button"
          className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? "Change File" : "Image*"}
        </button>
        <span className="ml-2 text-gray-600">
          {image ? image.name : "No file chosen"}
        </span>
        <input
          className="border p-2 w-full"
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
        <input
          className="border p-2 w-full"
          placeholder="Projected Sale Price*"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={projectedSalePrice}
          onChange={e => {
            // Only allow number inputs
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              setProjectedSalePrice(val);
            }
          }}
          required
        />
        <input
          className="border p-2 w-full"
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
        <select
          className="border p-2 w-full"
          value={condition}
          onChange={e => setCondition(e.target.value)}
          required
        >
          <option value="" disabled>
            Condition*
          </option>
          {CONDITION_OPTIONS.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <input
          className="border p-2 w-full"
          placeholder="Address*"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
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
        <textarea
          className="border p-2 w-full"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <PickupTimeSelect
          value={pickupTime}
          onChange={setPickupTime}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {step === 'review'
            ? loading ? 'Reviewing...' : 'Submit for Quote Review'
            : 'Submit Lead'}
        </button>
      </form>
      {botResult && (
        <div
          className={`p-4 mb-4 rounded text-white ${
            botResult.is_below_high_end ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div className="font-bold text-lg">
            {botResult.is_below_high_end ? 'Accepted by Quote Bot' : 'Rejected by Quote Bot'}
          </div>
          <div className="mt-2">
            <span className="font-semibold">Suggested Offer Range:</span> {botResult.resale_range}
          </div>
          <div className="mt-1 italic">{botResult.reasoning}</div>
        </div>
      )}
    </div>
  );
}