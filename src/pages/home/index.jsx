import AboutSection from "../../components/home/AboutSection";
import CareerSection from "../../components/home/CareerSection";
import HeroSection from "../../components/home/HeroSection";
import Navbar from "../../components/navbar";

export default function Home(){
    return (
        <>
            <div>
                <Navbar />
                <main id='' className="h-screen">
                    <section id="home" className="relative w-full scroll-mt-20 min-h-screen flex items-center justify-center snap-start text-[#141414]">
                        <HeroSection holdMs={7200} fadeMs={220} />
                    </section>
                    <section id="career" className="relative w-full scroll-mt-20 min-h-screen flex items-center justify-center snap-start">
                        <CareerSection holdMs={7200} fadeMs={220} />
                    </section>
                    <section id="about" className="relative w-full scroll-mt-20 min-h-screen bg-[#141414] flex items-center justify-center snap-start">
                        <AboutSection />
                    </section>
                </main>
            </div>
        </>
    )
}