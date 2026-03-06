import LandingFooter from '@/components/landing/LandingFooter';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingShell from '@/components/landing/LandingShell';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import ServicesSection from '@/components/landing/ServicesSection';

export default function Home() {
  return (
    <LandingShell header={<LandingHeader />} footer={<LandingFooter />}>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
    </LandingShell>
  );
}
