'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react'
import { 
  MegaphoneIcon,
  ShareIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export function RealEstateMarketing() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'social' | 'email' | 'portals'>('campaigns')

  // TODO: Load from backend
  const campaigns = useMemo(() => [
    {
      id: '1',
      name: 'Frühjahrs-Kampagne 2024',
      type: 'Email',
      status: 'Aktiv',
      recipients: 1234,
      openRate: 24.5,
      clickRate: 8.3,
      properties: 12
    },
    {
      id: '2',
      name: 'Premium-Immobilien',
      type: 'Social Media',
      status: 'Aktiv',
      recipients: 5600,
      engagement: 12.8,
      reach: 8900,
      properties: 5
    }
  ], [])

  const socialPosts = useMemo(() => [
    {
      id: '1',
      platform: 'Facebook',
      content: 'Neue 3-Zimmer-Wohnung in bester Lage verfügbar!',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      engagement: 145,
      reach: 1200,
      date: '2024-01-20'
    },
    {
      id: '2',
      platform: 'Instagram',
      content: 'Traumhaftes Einfamilienhaus mit Garten',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
      engagement: 289,
      reach: 3400,
      date: '2024-01-18'
    }
  ], [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing</h2>
          <p className="text-gray-600 mt-1">Kampagnen, Social Media & Portale</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MegaphoneIcon className="h-5 w-5" />
          Neue Kampagne
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'campaigns', label: 'Kampagnen', icon: MegaphoneIcon },
          { id: 'social', label: 'Social Media', icon: ShareIcon },
          { id: 'email', label: 'E-Mail', icon: EnvelopeIcon },
          { id: 'portals', label: 'Portale', icon: GlobeAltIcon },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                      {campaign.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      campaign.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Bearbeiten
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Empfänger</div>
                  <div className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('de-DE').format(campaign.recipients)}
                  </div>
                </div>
                {campaign.openRate && (
                  <div>
                    <div className="text-sm text-gray-600">Öffnungsrate</div>
                    <div className="text-xl font-bold text-gray-900">{campaign.openRate}%</div>
                  </div>
                )}
                {campaign.clickRate && (
                  <div>
                    <div className="text-sm text-gray-600">Klickrate</div>
                    <div className="text-xl font-bold text-gray-900">{campaign.clickRate}%</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">Immobilien</div>
                  <div className="text-xl font-bold text-gray-900">{campaign.properties}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-4">
          {socialPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={post.image}
                  alt={post.content}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                        {post.platform}
                      </span>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-900 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>{post.engagement} Engagement</div>
                    <div>{new Intl.NumberFormat('de-DE').format(post.reach)} Reach</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'email' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">E-Mail Marketing</h3>
          <div className="space-y-3">
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors text-left">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">Neue E-Mail-Kampagne erstellen</div>
                  <div className="text-sm text-gray-600">Erstellen Sie eine personalisierte E-Mail-Kampagne</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'portals' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portale</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Immobilienscout24', status: 'Verbunden', listings: 18 },
              { name: 'Idealista', status: 'Verbunden', listings: 12 },
              { name: 'ImmoWelt', status: 'Nicht verbunden', listings: 0 },
              { name: 'eBay Kleinanzeigen', status: 'Verbunden', listings: 8 },
            ].map((portal) => (
              <div
                key={portal.name}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{portal.name}</div>
                  <span className={`px-2 py-1 text-xs rounded-lg ${
                    portal.status === 'Verbunden' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {portal.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{portal.listings} Listings</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
