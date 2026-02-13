import { Router } from "express";

const router = Router();

const adConfig = [
  {
    slot_name: "banner_homepage",
    ad_unit: "/dummy_network/Travel/Home",
    sizes: [
      [300, 250],
      [728, 90],
    ],
    targeting: { section: "homepage", lang: "id" },
  },
  {
    slot_name: "banner_article",
    ad_unit: "/dummy_network/Travel/Article",
    sizes: [[300, 600]],
    targeting: { section: "article", lang: "id" },
  },
];

router.get("/ad-configs", (req, res) => {
  res.json(adConfig);
});

/**
 * 
 * 
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3362051787556730"
     crossorigin="anonymous"></script>
  <!-- ad_unit_test -->
  <ins class="adsbygoogle"
     style="display:inline-block;width:750px;height:140px"
     data-ad-client="ca-pub-3362051787556730"
     data-ad-slot="3145191324"></ins>
  <script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
 */

export default router;
