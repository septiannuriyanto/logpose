'use client';

import BenefitsSection from '@/components/ui/landing/BenefitsSection';
import CTASection from '@/components/ui/landing/CTASection';
import FeaturesSection from '@/components/ui/landing/FeaturesSection';
import HeroSection from '@/components/ui/landing/HeroSection';
import TestimonialsSection from '@/components/ui/landing/TestimonialsSection';
import WhyChooseUsSection from '@/components/ui/landing/WhyChooseUsSection';

export default function LandingPage() {
  return (
    <main className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <HeroSection />

      <WhyChooseUsSection />

      <TestimonialsSection />

      <FeaturesSection />

      <BenefitsSection />

      <CTASection />
    </main>
  );
}
