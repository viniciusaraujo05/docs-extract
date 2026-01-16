<?php

namespace App\Http\Controllers;

use App\Mail\SupportRequestMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SupportController extends Controller
{
    /**
     * Show the support request form.
     */
    public function create()
    {
        return Inertia::render('support/create');
    }

    /**
     * Send the support request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
            'attachments.*' => 'nullable|image|max:5120', // 5MB max, images only
            'attachments' => 'nullable|array|max:5', // Max 5 files
        ]);

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                // Store in local storage (not public) so it's secure and accessible by queue worker
                $attachmentPaths[] = $file->store('support-attachments');
            }
        }

        // Remove attachments from validated data to avoid serialization error
        // since UploadedFile objects cannot be serialized for queueing
        $data = collect($validated)->except(['attachments'])->toArray();

        Mail::to('help@docset.app')->send(new SupportRequestMail($request->user(), $data, $attachmentPaths));
        
        return back()->with('success', __('Your message has been sent successfully. We will contact you shortly.'));
    }
}
