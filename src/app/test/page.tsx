'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Plus, Search, X } from 'lucide-react';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 1; // Matches the screenshot's single document view
  const ingestions = [
    {
      id: 1,
      date: '2/25/2025, 7:43:38 PM',
      type: 'records with total treatment cost',
      count: 2762,
    },
    {
      id: 2,
      date: '2/20/2025, 8:23:45 AM',
      type: 'compound with cost and treatment',
      count: 4663,
    },
    {
      id: 3,
      date: '2/20/2025, 7:41:46 AM',
      type: 'compound with treatment cost details version 2',
      count: 4663,
    },
    {
      id: 4,
      date: '2/20/2025, 5:04:22 AM',
      type: 'compounds with combination therapies and cost information',
      count: 0,
    },
  ];

  const documents = [
    {
      hssid: '1128096',
      compound: 'bimekizumab',
      indication:
        'Bimekizumab monotherapy for treatment of moderate to severe Hidradenitis suppurativa in adults and elderly with an inadequate response to a course of a systemic antibiotic HS',
      consumer_price_total: '19829.90',
      currency: 'DKK',
      more_info_url: 'https://ihsi-horizons.candb.ecri.org/record/1128096',
      file_name: 'records_with_total_treatment_cost.csv',
      index_name: 'raw-jahgtgcwh',
      id: '6xm1PSUb6jVWOOklL6',
    },
    {
      hssid: '1128843',
      compound: 'bimekizumab',
      indication:
        'Bimekizumab monotherapy for treatment of moderate to severe Hidradenitis suppurativa in adults and elderly with an inadequate response to a course of a systemic antibiotic HS',
      consumer_price_total: '19829.90',
      currency: 'DKK',
      more_info_url: 'https://ihsi-horizons.candb.ecri.org/record/1128843',
      file_name: 'records_with_total_treatment_cost.csv',
      index_name: 'raw-jahgtgcwh',
      id: '6xm1PSUb6jVWOOklL6',
    },
  ];

  // Pagination logic
  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;
  const currentDocs = documents.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(documents.length / documentsPerPage);

  // Search filtering
  const filteredDocs = documents.filter(
    (doc) =>
      doc.compound.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.indication.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='min-h-screen bg-gray-50 text-gray-800 font-inter'>
      {/* Main Layout */}
      <div className='p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4'>
          {/* Ingestion Panel */}
          <div className='space-y-2'>
            <Button
              variant='outline'
              className='w-full bg-green-50 text-green-700 border-green-300 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors duration-200'
            >
              <Plus className='w-5 h-5 mr-2' /> Create New
            </Button>
            {ingestions.map((ingestion) => (
              <Card
                key={ingestion.id}
                className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
              >
                <CardContent className='p-3 flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>
                      Ingested on: {ingestion.date}
                    </p>
                    <p className='text-md font-medium text-gray-800 line-clamp-1'>
                      {ingestion.type}
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-blue-100 text-blue-800'
                  >
                    {ingestion.count} Docs
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Panel */}
          <div className='space-y-4'>
            <Card className='bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
              <CardHeader className='border-b border-gray-200 rounded-t-xl bg-gray-50 p-4'>
                <CardTitle className='text-lg font-semibold text-blue-700'>
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 space-y-4'>
                <div className='relative'>
                  <Input
                    placeholder='Keyword search or advanced search: (quick AND fox) OR (brown AND fox)'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full bg-white border-gray-300 focus:border-blue-500 text-gray-900 rounded-lg p-2 pr-10'
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                  {searchQuery && filteredDocs.length > 0 && (
                    <div className='absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg'>
                      {filteredDocs.map((doc, index) => (
                        <div
                          key={index}
                          className='p-2 hover:bg-gray-100 cursor-pointer text-sm'
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedDocIndex(documents.indexOf(doc));
                          }}
                        >
                          {doc.compound}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    variant='outline'
                    className='text-blue-600 hover:text-blue-800'
                  >
                    View columns
                  </Button>
                  <Button
                    variant='outline'
                    className='text-blue-600 hover:text-blue-800'
                  >
                    View search tips
                  </Button>
                  <Button
                    className='bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-colors'
                    onClick={() => setSelectedDocIndex(0)}
                  >
                    <Search className='w-4 h-4 mr-2' /> Search
                  </Button>
                  <Button
                    variant='ghost'
                    className='text-gray-500 hover:text-gray-700 rounded-lg px-4 py-2 transition-colors'
                  >
                    <X className='w-4 h-4 mr-2' /> Reset
                  </Button>
                </div>
                <div className='space-y-2'>
                  {currentDocs.map((doc, index) => (
                    <Card
                      key={index}
                      className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                    >
                      <CardContent className='p-4'>
                        <Tabs value={`doc${index}`} className='w-full'>
                          <TabsList className='bg-gray-50 p-1 rounded-lg'>
                            <TabsTrigger
                              value={`doc${index}`}
                              className='data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-md px-3 py-1 text-sm transition-colors'
                            >
                              Document: {index + 1} of {documents.length}
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value={`doc${index}`} className='mt-2'>
                            <div className='p-4 bg-gray-50 rounded-lg shadow-inner space-y-2'>
                              <p>
                                <strong className='text-blue-700'>
                                  hssid:
                                </strong>{' '}
                                {doc.hssid}
                              </p>
                              <p>
                                <strong className='text-blue-700'>
                                  compound:
                                </strong>{' '}
                                {doc.compound}
                              </p>
                              <p>
                                <strong className='text-blue-700'>
                                  indication:
                                </strong>{' '}
                                {doc.indication}
                              </p>
                              <p>
                                <strong className='text-blue-700'>
                                  consumer_price_total:
                                </strong>{' '}
                                {doc.consumer_price_total} {doc.currency}
                              </p>
                              <p>
                                <strong className='text-blue-700'>
                                  more_info_url:
                                </strong>{' '}
                                <a
                                  href={doc.more_info_url}
                                  className='text-blue-600 hover:underline'
                                >
                                  {doc.more_info_url}
                                </a>
                              </p>
                              <p>
                                <strong className='text-blue-700'>
                                  file_name:
                                </strong>{' '}
                                {doc.file_name}
                              </p>
                              <p>
                                <strong className='text-blue-700'>
                                  index_name:
                                </strong>{' '}
                                {doc.index_name}
                              </p>
                              <p>
                                <strong className='text-blue-700'>id:</strong>{' '}
                                {doc.id}
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                  <div className='flex justify-between items-center mt-4'>
                    <Button
                      variant='outline'
                      className='text-blue-600 hover:text-blue-800'
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className='text-sm text-gray-600'>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant='outline'
                      className='text-blue-600 hover:text-blue-800'
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
