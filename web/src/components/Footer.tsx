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
      className="bg-[#16100b] text-stone-400 py-14 px-6 select-none border-t border-[#2d221a]"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Company Section with Logo */}
        <div>
          {/* Put your logo here: web/public/assets/telemax-logo.png */}
          <img
            src="/assets/telemax-logo.png"
            alt="Telemax Logo"
            className="h-20 w-auto object-contain mb-6"
            draggable={false}
          />

          <p className="text-stone-400 max-w-sm leading-relaxed mb-6">
            {t("footer.description")}
          </p>

          <div className="flex space-x-5">
            {[
              { Icon: FaFacebookF, href: "#" },
              { Icon: FaInstagram, href: "#" },
              { Icon: FaTwitter, href: "#" },
              { Icon: FaLinkedinIn, href: "#" },
            ].map(({ Icon, href }, idx) => (
              <a
                key={idx}
                href={href}
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
          <h4 className="text-white font-semibold text-xl mb-4">
            {t("footer.links.title")}
          </h4>

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

            {/* If your products page route is /orders, this is correct */}
            <li>
              <Link to="/orders" className="hover:text-amber-600 transition-colors">
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
          <h4 className="text-white font-semibold text-xl mb-4">
            {t("footer.contact.title")}
          </h4>

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