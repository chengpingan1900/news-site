import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Global News Events',
  description: 'Learn more about Global News Events, a leading news organization based in Washington D.C.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-serif font-bold mb-6 text-gray-900">About Global News Events</h1>
        <div className="w-24 h-1 bg-red-700 mx-auto"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-6">Our Mission</h2>
          <p className="font-serif text-lg text-gray-700 leading-relaxed mb-6">
            Global News Events is dedicated to delivering accurate, unbiased, and timely news from every corner of the globe. In an era of information overload, we strive to be your trusted beacon of truth.
          </p>
          <p className="font-serif text-lg text-gray-700 leading-relaxed">
            Headquartered in the heart of <strong>Washington D.C.</strong>, we operate with a singular focus: to empower our readers with the knowledge they need to navigate a complex world.
          </p>
        </div>
        <div className="bg-gray-100 p-8 border border-gray-200 text-center">
          <div className="text-6xl font-bold text-black mb-2">74</div>
          <div className="text-sm font-sans font-bold uppercase text-gray-500 tracking-widest mb-8">Dedicated Professionals</div>
          
          <div className="text-6xl font-bold text-black mb-2">5</div>
          <div className="text-sm font-sans font-bold uppercase text-gray-500 tracking-widest mb-8">Chief Editors</div>
          
          <div className="text-6xl font-bold text-black mb-2">DC</div>
          <div className="text-sm font-sans font-bold uppercase text-gray-500 tracking-widest">Based in Washington</div>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-serif font-bold mb-8 text-center">Our Leadership</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
          {['Sarah Jenkins', 'David Roth', 'Michael Chen', 'Elena Rodriguez', 'James Wilson'].map((name, i) => (
            <div key={i} className="group">
              <div className="w-full aspect-square bg-gray-200 mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                {/* Placeholder for editor images */}
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-4xl font-serif font-bold">
                  {name.charAt(0)}
                </div>
              </div>
              <h3 className="font-serif font-bold text-lg">{name}</h3>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-wide">Chief Editor</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black text-white p-12 text-center">
        <h2 className="text-3xl font-serif font-bold mb-6">Contact Us</h2>
        <p className="font-serif text-lg mb-8 max-w-2xl mx-auto text-gray-300">
          Have a story tip or inquiry? Our team in Washington D.C. is ready to hear from you.
        </p>
        <div className="font-sans text-sm tracking-widest uppercase space-y-2">
          <p>1200 News Avenue NW, Washington, DC 20005</p>
          <p>press@globalnewsevents.org</p>
          <p>+1 (202) 555-0123</p>
        </div>
      </div>
    </div>
  );
}
