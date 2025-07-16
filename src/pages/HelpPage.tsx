'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  Upload, 
  Shield, 
  CreditCard, 
  FileText, 
  Search, 
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle
} from 'lucide-react'

export default function HelpPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  const categories = [
    {
      id: 'upload',
      title: 'Upload & Watermarking',
      icon: Upload,
      description: 'Learn how to upload and watermark your files',
      articles: [
        'How to upload PDF and DOCX files',
        'Understanding watermark processing',
        'Downloading watermarked documents',
        'Supported file formats and sizes'
      ]
    },
    {
      id: 'verify',
      title: 'Verification Process',
      icon: Shield,
      description: 'Understand how to verify AI usage of your content',
      articles: [
        'How verification works',
        'Understanding verification results',
        'What to do when matches are found',
        'Reverification process'
      ]
    },
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      icon: CreditCard,
      description: 'Manage your subscription and billing',
      articles: [
        'Subscription plans comparison',
        'How to upgrade your plan',
        'Billing and payment methods',
        'Cancellation and refunds'
      ]
    },
    {
      id: 'general',
      title: 'General Usage',
      icon: FileText,
      description: 'General tips and best practices',
      articles: [
        'Getting started guide',
        'Best practices for content protection',
        'Account security tips',
        'Troubleshooting common issues'
      ]
    }
  ]

  const steps = [
    {
      number: 1,
      title: 'Upload Your Files',
      description: 'Drag and drop your PDF or DOCX files into the upload area, or click "Browse Files" to select them from your device.',
      icon: Upload,
      details: [
        'Supported formats: PDF, DOCX',
        'Maximum file size: 100MB (Professional plan)',
        'Multiple files can be uploaded simultaneously',
        'Files are processed securely and encrypted'
      ]
    },
    {
      number: 2,
      title: 'Apply Watermarks',
      description: 'Our advanced system applies invisible watermarks to your documents that can be detected later.',
      icon: Shield,
      details: [
        'Watermarks are completely invisible to readers',
        'Does not affect document quality or formatting',
        'Processing typically takes 30-60 seconds',
        'Watermarks are unique to your account'
      ]
    },
    {
      number: 3,
      title: 'Verify AI Usage',
      description: 'Use our verification system to check if your content has been used by AI models across the web.',
      icon: HelpCircle,
      details: [
        'Scans major AI platforms and services',
        'Results available within minutes',
        'Detailed match information provided',
        'Regular monitoring available with Professional plan'
      ]
    },
    {
      number: 4,
      title: 'Manage Subscription',
      description: 'Choose the plan that fits your needs and manage your billing preferences.',
      icon: CreditCard,
      details: [
        'Free plan: 5 files per month',
        'Professional plan: Unlimited files',
        'Secure payment processing',
        'Cancel anytime with no penalties'
      ]
    }
  ]

  const faqs = [
    {
      question: 'How does watermarking work?',
      answer: 'Our system embeds invisible digital watermarks into your documents that can be detected later. These watermarks don\'t affect the visual appearance or functionality of your files.'
    },
    {
      question: 'Can AI systems detect the watermarks?',
      answer: 'The watermarks are designed to be undetectable by AI systems during normal processing, but our verification system can identify them when checking for usage.'
    },
    {
      question: 'What happens if my content is found being used by AI?',
      answer: 'You\'ll receive a detailed report showing where your content was detected, including confidence levels and platform information. You can then take appropriate action.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, all files are encrypted during upload, processing, and storage. We follow industry-standard security practices and never share your content with third parties.'
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Everything you need to know about using WatermarkPro
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <category.icon className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {category.description}
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                <span>View articles</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
              
              {selectedCategory === category.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ul className="space-y-2">
                    {category.articles.map((article, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">
                        • {article}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Step-by-Step Guide */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Step-by-Step Guide
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <step.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Still Need Help?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Our support team is here to help you with any questions or issues.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Chat with our support team in real-time
              </p>
              <Button variant="secondary" size="sm">
                Start Chat
              </Button>
            </div>
            <div className="text-center">
              <Mail className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <Button variant="secondary" size="sm">
                Send Email
              </Button>
            </div>
            <div className="text-center">
              <Phone className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Phone Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Call us for immediate assistance (Professional plan)
              </p>
              <Button variant="secondary" size="sm">
                Call Now
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}