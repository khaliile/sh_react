import {
  FaShieldAlt, FaStar, FaSkullCrossbones, FaFire, FaEye, FaFeatherAlt, FaSun,
  FaDiceD20, FaDragon, FaCrown, FaBookDead, FaGem, FaDrumstickBite,
  FaSeedling, FaScroll, FaSyringe, FaUtensils, FaMagic, FaBolt
} from 'react-icons/fa';

// Helper component to render React Icons for Anime Series
export function SeriesIcon({ series, style = {} }) {
  switch (series) {
    case 'One Piece':           return <FaSkullCrossbones style={style} />;
    case 'Naruto':              return <FaFire style={style} />;
    case 'Jujutsu Kaisen':      return <FaEye style={style} />;
    case 'Bleach':              return <FaFeatherAlt style={style} />;
    case 'Attack on Titan':     return <FaShieldAlt style={style} />;
    case 'Demon Slayer':        return <FaSun style={style} />;
    case 'Hunter x Hunter':     return <FaDiceD20 style={style} />;
    case 'Dragon Ball':         return <FaDragon style={style} />;
    case 'Solo Leveling':       return <FaCrown style={style} />;
    case 'Death Note':          return <FaBookDead style={style} />;
    case 'Fullmetal Alchemist': return <FaGem style={style} />;
    default:                    return <FaStar style={style} />;
  }
}

// Helper component to render React Icons for Consumable Power-Ups
export function ItemIcon({ itemId, style = {} }) {
  switch (itemId) {
    case 'gomu_power':        return <FaDrumstickBite style={style} />;
    case 'domain_expansion':  return <FaEye style={style} />;
    case 'senzu_bean':        return <FaSeedling style={style} />;
    case 'bankai_surge':      return <FaFire style={style} />;
    case 'shadow_clone':      return <FaScroll style={style} />;
    case 'titan_serum':       return <FaSyringe style={style} />;
    case 'sun_breathing':     return <FaSun style={style} />;
    case 'shadow_arise':      return <FaCrown style={style} />;
    case 'nen_amplifier':     return <FaBolt style={style} />;
    case 'nakama_shield':     return <FaShieldAlt style={style} />;
    case 'soul_feast':        return <FaUtensils style={style} />;
    default:                  return <FaMagic style={style} />;
  }
}
