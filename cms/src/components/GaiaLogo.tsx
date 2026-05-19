/**
 * Payload admin Logo slot — intentionally renders nothing on the login
 * screen so the BIG hero (GaiaBeforeLogin) is the SOLE brand on the page.
 *
 * Why a no-op component instead of omitting from config: Payload renders
 * its DEFAULT "Payload" wordmark when graphics.Logo is unset, which broke
 * white-labelling. Wiring an empty component is the only way to suppress it.
 */
import React from "react";

const GaiaLogo: React.FC = () => null;

export default GaiaLogo;
