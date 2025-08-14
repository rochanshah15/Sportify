import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { CreditCard, Lock, CheckCircle } from 'lucide-react'

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe('pk_test_51234567890abcdef') // Replace with your actual publishable key

const CheckoutForm = ({ amount, onSuccess, onError, bookingDetails }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    const cardElement = elements.getElement(CardElement)

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: bookingDetails.userName,
        email: bookingDetails.userEmail,
      },
    })

    if (error) {
      console.error('Payment method creation failed:', error)
      onError(error.message)
      setProcessing(false)
      return
    }

    // Simulate payment intent confirmation (in real app, create payment intent on server)
    try {
      // Mock successful payment
      setTimeout(() => {
        setSucceeded(true)
        setProcessing(false)
        onSuccess({
          paymentMethodId: paymentMethod.id,
          amount: amount,
          currency: 'inr'
        })
      }, 2000)
    } catch (err) {
      console.error('Payment failed:', err)
      onError('Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  }

  if (succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your booking has been confirmed.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Box:</span>
            <span className="font-medium">{bookingDetails.boxName}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{bookingDetails.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{bookingDetails.time}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-primary-600">₹{amount}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard size={16} className="inline mr-2" />
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock size={16} className="text-green-500" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>Pay ₹{amount}</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}

const StripePayment = ({ amount, onSuccess, onError, bookingDetails }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-md mx-auto">
        <CheckoutForm
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          bookingDetails={bookingDetails}
        />
      </div>
    </Elements>
  )
}

export default StripePayment