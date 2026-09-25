import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdoptionApplication() {
  const [animalType, setAnimalType] = useState('Dog');
  const [gender, setGender] = useState('Male');

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation Back */}
        <Link to="/adoption" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <i className="fa-solid fa-arrow-left"></i> Back to Pet Adoption Feed
        </Link>

        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pet for Adoption</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect your foster rescue with verified adopters. Share their personality, care routine, and health status to find their ideal forever home.
          </p>
        </div>

        {/* Section 1: Pet Identity & Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-[#a34e29] text-xs flex items-center justify-center font-bold">1</span>
              <span>Pet Identity & Category</span>
            </div>
            <span className="text-[11px] text-slate-400">* Required fields</span>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">Animal Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAnimalType('Dog')}
                className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center relative ${
                  animalType === 'Dog'
                    ? 'border-[#a34e29] bg-orange-50/30 text-[#a34e29]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {animalType === 'Dog' && (
                  <i className="fa-solid fa-circle-check absolute top-3 right-3 text-xs text-[#a34e29]"></i>
                )}
                <i className="fa-solid fa-paw text-2xl mb-1"></i>
                <span className="font-bold text-xs">Dog</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Canine rescue companion</span>
              </button>

              <button
                type="button"
                onClick={() => setAnimalType('Cat')}
                className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center relative ${
                  animalType === 'Cat'
                    ? 'border-[#a34e29] bg-orange-50/30 text-[#a34e29]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {animalType === 'Cat' && (
                  <i className="fa-solid fa-circle-check absolute top-3 right-3 text-xs text-[#a34e29]"></i>
                )}
                <i className="fa-solid fa-cat text-2xl mb-1"></i>
                <span className="font-bold text-xs">Cat</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Feline rescue friend</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pet Name *</label>
                <input
                  type="text"
                  defaultValue="Buster"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#a34e29] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      gender === 'Male'
                        ? 'border-[#a34e29] bg-orange-50/30 text-[#a34e29]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <i className="fa-solid fa-mars text-[#a34e29]"></i> Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      gender === 'Female'
                        ? 'border-[#a34e29] bg-orange-50/30 text-[#a34e29]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <i className="fa-solid fa-venus"></i> Female
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Age *</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#a34e29] transition">
                  <option>Young (1.5 Years)</option>
                  <option>Puppy/Kitten (&lt; 1 Year)</option>
                  <option>Adult (2-6 Years)</option>
                  <option>Senior (7+ Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Breed / Mix Description</label>
                <input
                  type="text"
                  defaultValue="Golden Shepherd Mix"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#a34e29] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Post Status</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#a34e29] transition">
                  <option>Ready for Home</option>
                  <option>In Foster Care</option>
                  <option>Medical Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Pet Photos & Gallery */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-[#a34e29] text-xs flex items-center justify-center font-bold">2</span>
              <span>Pet Photos & Gallery</span>
            </div>
            <span className="text-[11px] text-slate-400">Up to 6 images</span>
          </div>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-indigo-100 bg-indigo-50/20 rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#a34e29] flex items-center justify-center mx-auto">
              <i className="fa-regular fa-image text-lg"></i>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Upload photos of your foster pet</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Clear, well-lit photos showing their face and body help pets find loving homes faster. Supports JPG, PNG up to 10MB each.
              </p>
            </div>
            <button type="button" className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 transition">
              Browse Photo Library
            </button>
          </div>

          {/* Image Previews */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block">Current Uploaded Photos (First is Cover)</span>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 relative group">
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400"
                  alt="Pet preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button type="button" className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition">
                <i className="fa-solid fa-plus text-xs"></i>
                <span className="text-[10px] font-semibold">Add Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Household Compatibility & Training Attributes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-800 text-xs tracking-wide">Household Compatibility & Training Attributes</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Captions</label>
              <span className="text-[10px] text-slate-400">284 characters</span>
            </div>
            <textarea
              rows={4}
              defaultValue="Meet Buster! A gentle, resilient boy who was found stray and has blossomed in foster care. He loves brisk morning strolls, snoozing by your feet while you work, and shows remarkable patience with older kids. He is fully crate-trained, quiet through the night, and ready for a patient, loving forever companion."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#a34e29] transition leading-relaxed text-slate-700"
            />
          </div>
        </div>

        {/* Section 5: Foster Caregiver & Screening Criteria */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-[#a34e29] text-xs flex items-center justify-center font-bold">5</span>
              <span>Foster Caregiver & Screening Criteria</span>
            </div>
            <span className="text-[11px] text-slate-400">Coordination Logistics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Foster Caregiver</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 font-semibold">
                  <i className="fa-regular fa-circle-check text-emerald-600"></i> Sarah Jenkins
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                  Verified Foster
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">General Area / City *</label>
              <input
                type="text"
                defaultValue="Maple Valley Area"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#a34e29] transition"
              />
            </div>
          </div>
        </div>

        {/* Bottom Submission Bar */}
        <div className="bg-[#f3f4f9] border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-slate-500 max-w-lg">
            <i className="fa-solid fa-circle-info text-[#a34e29] mt-0.5 text-base shrink-0"></i>
            <p className="text-[11px] leading-relaxed">
              Your listing is published immediately to verified adopters. You can review applicant questionnaires and schedule meet-and-greets at your own pace.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <Link to="/adoption" className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition">
              Cancel
            </Link>
            <button type="button" className="bg-[#a34e29] hover:bg-[#873d1f] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2">
              <i className="fa-solid fa-upload text-white"></i> Publish Adoption Post
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}