import React from 'react';
import { BrainCircuit } from 'lucide-react';

const GenerativeAILogo: React.FC = () => {
  return (
    <div className='flex items-center gap-3 text-blue-600 dark:text-blue-400'>
      {/* Brain Icon */}
      <BrainCircuit className='w-12 h-12 text-blue-600 dark:text-blue-300' />

      {/* Text Section */}
      <div className='flex flex-col'>
        <h1 className='text-2xl font-bold font-orbitron bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent'>
          Generative AI
        </h1>
        <div className='flex items-center gap-1'>
          {/* Elasticsearch Icon */}

          <div className='flex flex-row space-x-2  items-center text-sm font-mono font-medium text-gray-600 dark:text-gray-300'>
            <span>with</span>
            <div className='flex flex-row space-x-1 items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                className='h-4 w-4'
                viewBox='0 0 32 32'
              >
                <title>
                  {'icon / product-logo / 32x32px / elasticsearch / color'}
                </title>
                <defs>
                  <path id='a' d='M.644 0h26.835v9H.644z' />
                  <path id='c' d='M.644 0h26.835v9H.644z' />
                </defs>
                <g fill='none' fillRule='evenodd'>
                  <path
                    fill='#343741'
                    d='M1 16c0 1.384.194 2.72.524 4H21a4 4 0 0 0 0-8H1.524A15.984 15.984 0 0 0 1 16'
                  />
                  <g transform='translate(2)'>
                    <mask id='b' fill='#fff'>
                      <use xlinkHref='#a' />
                    </mask>
                    <path
                      fill='#FEC514'
                      d='M25.924 7.662A15.279 15.279 0 0 0 27.48 6C24.547 2.345 20.05 0 15 0 8.679 0 3.239 3.678.644 9H22.51a5.035 5.035 0 0 0 3.413-1.338'
                      mask='url(#b)'
                    />
                  </g>
                  <g transform='translate(2 23)'>
                    <mask id='d' fill='#fff'>
                      <use xlinkHref='#c' />
                    </mask>
                    <path
                      fill='#00BFB3'
                      d='M22.51 0H.645C3.24 5.322 8.679 9 15 9c5.05 0 9.547-2.346 12.48-6a15.197 15.197 0 0 0-1.556-1.662A5.03 5.03 0 0 0 22.51 0'
                      mask='url(#d)'
                    />
                  </g>
                </g>
              </svg>

              <span>Elasticsearch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerativeAILogo;
