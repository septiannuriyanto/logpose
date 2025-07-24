'use client';
import BenefitsSection from '@/components/ui/landing/BenefitsSection';
import CTASection from '@/components/ui/landing/CTASection';
import FeaturesSection from '@/components/ui/landing/FeaturesSection';
import HeroSection from '@/components/ui/landing/HeroSection';
import TestimonialsSection from '@/components/ui/landing/TestimonialsSection';
import WhyChooseUsSection from '@/components/ui/landing/WhyChooseUsSection';
import { useRouter } from 'next/navigation';
import React from 'react';


export default function LandingPage() {

  const router = useRouter();


  return (
    <main className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Section 1: Hero */}
      <HeroSection/>

      {/* Section 2 */}
      <WhyChooseUsSection/>

      {/* Section 3 */}
      <TestimonialsSection/>


      {/* Section 4: Features */}
      <FeaturesSection/>
      
      {/* Section 5: Benefits */}
      <BenefitsSection/>

      {/* Section 6: CTA / Footer */}
      <CTASection/>

    </main>
  );
}
