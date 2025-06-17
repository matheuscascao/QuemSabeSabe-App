import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface CarouselProps {
  slides: {
    title: string;
    description: string;
    image?: string;
  }[];
  onComplete?: () => void;
}

export function Carousel({ slides, onComplete }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onComplete?.();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative h-full">
      {/* Slides */}
      <div className="overflow-hidden h-full">
        <div
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-4 h-full"
            >
              <div className="flex flex-col h-full">
                {slide.image && (
                  <div className="relative w-full h-[45vh] rounded-lg overflow-hidden bg-gray-100 mb-6">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <span className="text-indigo-600 font-bold text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-medium text-gray-900 mb-2">{slide.title}</h4>
                    <p className="text-gray-600 text-lg leading-relaxed">{slide.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          <ChevronLeft size={24} />
          Anterior
        </Button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={nextSlide}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          {currentSlide === slides.length - 1 ? 'Concluir' : 'Próximo'}
          <ChevronRight size={24} />
        </Button>
      </div>
    </div>
  );
} 