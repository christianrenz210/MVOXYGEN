<?php

namespace App\Mail;

use App\Models\RentalRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RentalApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public RentalRequest $rentalRequest
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Oxygen Tank Rental Request Has Been Approved - MV Oxygen Trading',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rental-approved',
            with: [
                'rentalRequest' => $this->rentalRequest,
                'customerName' => $this->rentalRequest->customer->name,
                'tankType' => $this->rentalRequest->tank_type,
                'quantity' => $this->rentalRequest->quantity,
                'startDate' => $this->rentalRequest->start_date ? $this->rentalRequest->start_date->format('F d, Y') : 'N/A',
                'endDate' => $this->rentalRequest->end_date ? $this->rentalRequest->end_date->format('F d, Y') : 'N/A',
            ]
        );
    }
}
