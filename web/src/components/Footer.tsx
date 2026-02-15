import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-[#16100b] text-stone-400 py-12 px-6 select-none"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* About */}
        <div>
          <h3 className="text-white font-serif text-2xl mb-4">{t("footer.company")}</h3>
          <p className="text-stone-400 max-w-sm leading-relaxed mb-6">
            {t("footer.description")}
          </p>
          <div className="flex space-x-5">
            {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="text-stone-400 hover:text-amber-600 transition-colors"
                aria-label="Social Link"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-xl mb-4">{t("footer.links.title")}</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-amber-600 transition-colors">
                {t("footer.links.home")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-amber-600 transition-colors">
                {t("footer.links.about")}
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-amber-600 transition-colors">
                {t("footer.links.products")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-600 transition-colors">
                {t("footer.links.contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold text-xl mb-4">{t("footer.contact.title")}</h4>
          <p className="mb-2">{t("footer.contact.location")}</p>
          <p className="mb-2">{t("footer.contact.phone")}</p>
          <p className="mb-2">{t("footer.contact.email")}</p>
          <p className="mt-6 text-sm text-stone-500 select-text">
            &copy; {new Date().getFullYear()} {t("footer.rights")}
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
