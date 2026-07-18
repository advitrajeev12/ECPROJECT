"use client";
import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

import VisionBanner from './VisionBanner';
import PrecisionBanner from './PrecisionBanner';
import WomenBanner from './WomenBanner';

const ValuesSlider = () => {
  const items = [
    <VisionBanner key="vision" />,
    <PrecisionBanner key="precision" />,
    <WomenBanner key="women" />,
  ];

  return (
    <div className="w-full relative overflow-hidden">
      <AliceCarousel
        items={items}
        disableButtonsControls
        autoPlay
        autoPlayInterval={5000}
        infinite
        animationDuration={800}
        disableDotsControls={false}
      />
      <style jsx global>{`
        .alice-carousel__dots {
          margin-top: 8px !important;
          margin-bottom: 8px !important;
        }
        .alice-carousel__dots-item {
          background-color: #cbd5e1 !important;
          width: 8px !important;
          height: 8px !important;
        }
        .alice-carousel__dots-item.__active {
          background-color: #5C7FCA !important;
          width: 24px !important;
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default ValuesSlider;
