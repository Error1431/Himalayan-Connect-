import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-400 dark:text-ink-soft-soft py-12 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-10">

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/support/contact" className="hover:text-emerald-500 transition-colors">Contact Customer Service</Link></li>
            <li><Link to="/support/safety" className="hover:text-emerald-500 transition-colors">Safety Resource Center</Link></li>
            <li><Link to="/support/cancel" className="hover:text-emerald-500 transition-colors">Cancel Booking</Link></li>
            <li><Link to="/support/faq" className="hover:text-emerald-500 transition-colors">Guides & FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Discover</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products" className="hover:text-emerald-500 transition-colors">Organic Produce</Link></li>
            <li><Link to="/homestays" className="hover:text-emerald-500 transition-colors">Eco Homestays</Link></li>
            <li><Link to="/experiences" className="hover:text-emerald-500 transition-colors">Cultural Experiences</Link></li>
            <li><Link to="/visits" className="hover:text-emerald-500 transition-colors">Direct Farm Visits</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Terms & Settings</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/terms/privacy" className="hover:text-emerald-500 transition-colors">Privacy Notice</Link></li>
            <li><Link to="/terms/service" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
            <li><Link to="/terms/accessibility" className="hover:text-emerald-500 transition-colors">Accessibility Statement</Link></li>
            <li><Link to="/terms/grievance" className="hover:text-emerald-500 transition-colors">Grievance Officer</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Partners</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/partners/farmer" className="hover:text-emerald-500 transition-colors">Register as Farmer</Link></li>
            <li><Link to="/partners/list-homestay" className="hover:text-emerald-500 transition-colors">List Your Homestay</Link></li>
            <li><Link to="/partners/login" className="hover:text-emerald-500 transition-colors">Partner Extranet Login</Link></li>
            <li><Link to="/partners/affiliate" className="hover:text-emerald-500 transition-colors">Become an Affiliate</Link></li>
          </ul>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Contact Interface</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <FaMapMarkerAlt className="text-emerald-500 mt-1 flex-shrink-0" />
              <span>TBI, Graphic Era University,<br />Dehradun, Uttarakhand 248002</span>
            </li>
            <li className="flex items-center gap-2.5">
              <FaPhoneAlt className="text-emerald-500 flex-shrink-0" />
              <a href="tel:+919389920016" className="hover:text-emerald-500 transition-colors">+91 93899 20016</a>
            </li>
            <li className="flex items-center gap-2.5">
              <FaEnvelope className="text-emerald-500 flex-shrink-0" />
              <a href="mailto:ankitrana125014@gmail.com" className="hover:text-emerald-500 transition-colors">ankitrana125014@gmail.com</a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;