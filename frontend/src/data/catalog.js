/** Demo catalog — image strings match Stitch HTML `src` for pixel parity; resolved via `img()` helper. */
export const PRODUCTS = [
  {
    id: 'feat-headphones',
    slug: 'wireless-over-ear-studio-headphones',
    brand: 'Acoustic Pro',
    title: 'Wireless Over-Ear Studio Headphones',
    price: 12499,
    rating: '4.8 (1.2k reviews)',
    vendor: 'SoundMaster India',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCus0icAiTz9VYQjw6LAJSbeRs9d578IHumY9sV-1hJEG3RW8sWNlDzrORmqOaFdO2yFw7YDAQ3I5U-odOF_Az46NVzstU5eWAklc6qBwjgctYujw1rEP2jRXAuJ2cj8LqcZ-lLuGyohaYOtGuRRdmKLNTPMZ6HDPDQHPB7qexVRsQzBFz9TsNZaf9eUBczMpIlkHNlvAvj8_BE1I_w8qNXtb9Ju0KBY_RDWYoOpxBO8lc0_MGcZfzBb8qJ_ubRFuwQQwphqH5qvrY',
  },
  {
    id: 'feat-watch',
    slug: 'classic-leather-quartz-watch',
    brand: 'Chronos',
    title: 'Classic Leather Quartz Watch',
    price: 5999,
    rating: '4.9 (850 reviews)',
    vendor: 'TimeKeepers',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLdXmvg4otcS8awGxG6OKSdtCQ_XTYpnvteAWvS2T2nNnwh2eX5IaITuopEtMVZBmGlbBpg4vvIGEUPimv2LEH46J2TvFPy0dHLAaGTAemRcGZBFKa1Ki-ymdl4zRTrW8DyXQz6maUX0xB9hVUQczgLRx9HXmceAYp-RCoJ6blEyPlaM-3_wq2oEW0jbDAYuwcgWWL7KvqiviB-luF4kCpYvGrIG32tBYzfz0ry2Oe80GTCO_7ELSpBKHhuV1tGNPUcXdSeq8-tuM',
  },
  {
    id: 'feat-sneakers',
    slug: 'pro-glide-running-sneakers',
    brand: 'Velocity',
    title: 'Pro-Glide Running Sneakers',
    price: 3499,
    rating: '4.7 (2.1k reviews)',
    vendor: 'FitIndia Sports',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCg1AHPOmAKihDFFJhHaXJ-jxRBJt2DxB1UgooUIbuRUmNrv5VF-3oKmkbU6fo6k6ZKjc8a1qNX974vA3KAkvluv8Vue9xIMsnciS1e_ZxKJWmQmYf2ijQhHTHwV5BWs9aMVoa9cufQ435VxWMJePlSi41SSkT0QgJEs5ujOWRIyW_8ReNUeTtnEQeiEXfxGl3Xm0RVabXgPBRayCKx3exRREEyj4yCvMnKIkZjt20xlHEZjBBX-nvmGqncfEi6HfCjYjkj0vOpTlY',
  },
  {
    id: 'feat-camera',
    slug: 'instant-film-retro-camera',
    brand: 'Lumina',
    title: 'Instant Film Retro Camera',
    price: 7299,
    rating: '4.5 (540 reviews)',
    vendor: 'RetroLens Co.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBixgj_69p1HvVNkb3QXyoYyeAQc5XgNoD1AqasebcAPEFZ0BGGCoao3oXSdELkIBmiyoE4_M6PrCL7130eOQYQ9pDGujdNMDUnXctonbOMAPFI93m3pI5AIDszNQFKf8w0ESTlCUQMupztx8q_sdOaBlga7KyO53FVRNS7vLfrfd9XxPvH1ricMnKiCiMsI7rnOmh9Zbk1bBvrd7DxI6fpbGK2LB9wVhIUmVrACKQx5gpIuy5etgrHZf5cYzh4Fz_X_qBLvM8t9SE',
  },
  {
    id: 'list-laptop',
    slug: 'premium-silver-laptop',
    brand: 'TechPro',
    title: 'UltraBook Pro 14"',
    price: 89999,
    rating: '4.6',
    vendor: 'Digital World',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmyXe12N8xq2yf5AS7eraLHqfCf7qa34Q00Dpb8NgVLNfSh7cJQzYTmxSQabGUoRlvn3fSWlMMPnnDHlP_8AVVDf3s8N6i0wGaexg4J_lbD6sX6Q-bwiDD2wYMfoeEX4FZlaWOI8nrC2mZLWyUVxqmLAMEEHP8qjVCFseh9OvA4hD2k0Ff4gXTBMl45SsaC2qrruXvkz4fz9aEQXb931jrgB7Lm2f1cV88SSAuasoHhBOSiFvUKrnd4fcolNhgCpGJFtVgU6h6MIE',
  },
  {
    id: 'list-headphones',
    slug: 'sonic-studio-headphones',
    brand: 'Sonic',
    title: 'Studio Reference Headphones',
    price: 7999,
    rating: '4.7',
    vendor: 'AudioMart',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjmy2LZa0TQ4DrOtvUniTRWHbYWJnp89MzMfzMwjw2G8X3lDRUvPVWxbBvzfRJoM_V0kugvO5IUH0y3lCj6kcNF7peO9c3HxHT1gAaJuaatChnF8cSJF-cmMxUYm8CEeDCDehDCqWv5W2Lcq0AKJ_sAXpj7G-ZibRPiE5YliXtRI0l6pEdA4bJpJSxpo5TDOioxtqd1pSjHuCcbKrAwLXA-dZU374zeaJ7afaTiS30tySY7PA4dRRisW5m1caUHLR2ls-UuA88ghg',
  },
  {
    id: 'list-watch',
    slug: 'minimal-white-watch',
    brand: 'Nord',
    title: 'Minimal White Dial Watch',
    price: 4299,
    rating: '4.5',
    vendor: 'Urban Time',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn8PNeNStMHHbQcKHYW85IEufkOzStyKV31G7wzK6XbptENwAqYknDyDsPpOlrtSVk1ys1uVK1DKRNjHyaV66P7WoQ9sQuy-IOH-fq2z6Fdhqt-gwHrnMFD30clCPxSMTtj4c5PsK422yd0Bmh5eGiCa6rchgL40ZRuUu5zqitNfX6SpnBwPNMFPJ0XmXJ0AOBSBgkKyGKymPi9XZOpev0THBTKouC8G1KiO5VgebVnSVV8SCsMjJwaoOk4oPjz1nVBAzexDWMTW0',
  },
  {
    id: 'list-smartwatch',
    slug: 'pulse-health-watch',
    brand: 'Pulse',
    title: 'Health Smartwatch Gen 2',
    price: 9999,
    rating: '4.4',
    vendor: 'WearTech',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBBUsYobowlbDhcnj88ZFo8cAzchvhRyE7t258YLk1UXBNNkDWYX9uXo_Sm9G9FPZ_S54eYW7X6FfWprbidwPoVKZuGiJgGL-SLJrVobsltHVmcqtWhv24gpRb4R5yoz5l7ri-RpaQ2nDqxSRN_5GDshs6QqWPL39JxTVXZjribc0LSGTRUfGiRUzZ3lx8zBYMJfveaJNE8WH7a_yB9zcFONnMwMgD8oaqu_ZZizmAZSJCJ8W31_vL9-Wt1rY1b8mvrDJ8ZA17xg_c',
  },
  {
    id: 'list-keyboard',
    slug: 'rgb-mechanical-keyboard',
    brand: 'KeyForge',
    title: 'RGB Mechanical Keyboard',
    price: 6499,
    rating: '4.8',
    vendor: 'Gamer Supply',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiVADYLe_pyN3kV_00HZIo-SksNJbSJ4k0xOVMEIi5wHMFAOv6d9_RHJCTJYqVusWtcbp6BzZYCFoLnHnq_AKfg-Zfq5i0BuDZHe_zAIGrZ-3Us1v5Mt4FCuCgdkosC61MgHDSEsjeiy4frtcIsHN7dynBx9q915TPBIxn8CPrQLD_mUC7voS-jcl2pwcj8R58IyKRjD2ID_u5l1TLNW_hnYSkzgg2t1OinX8BOrteGFrK82HKv9uRqWYffUjYdArT1zVDuuoSaII',
  },
  {
    id: 'list-polaroid',
    slug: 'pastel-instant-camera',
    brand: 'Snap',
    title: 'Pastel Instant Camera',
    price: 6899,
    rating: '4.3',
    vendor: 'RetroLens Co.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1DP0oxjoy8Y2cs96Mdh7aUsu32qy6BR6XK67cYI45MUNEUGGcs64_cRoZ2c-mtPQT2aqbUcFYyeB6AS5bpBTkKN7bZEy3UUTk9oz3AGItYCiYI63W_Snh5UfVJ_ucLKeXuXXSvd_ZZ8dEfeIy0u0lrLZ1Q6Tb0hk6ukUrs2DQO2-QmRONRLLfi6HpC4JO15fVIjyWjI8LqEvoFARDljv_iyNU5yhiK-856mImaCQnEssPI37H7QN1iRpgZZHuN-ycUn5qEkTPJiQ',
  },
];

export const CERAMIC_PRODUCT = {
  id: 'ceramic-dinner-set',
  slug: 'handcrafted-azure-ceramic-dinner-set',
  brand: 'Premium Collection',
  title: 'Handcrafted Deep Azure Ceramic Dinner Set',
  price: 3499,
  wasPrice: 4999,
  vendor: 'Jaipur Artisans Hub',
  description:
    'Elevate your dining experience with our signature azure dinner set. Each piece is hand-thrown by skilled artisans in Jaipur using traditional techniques and sustainable clay.',
  gallery: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD-1RGTH6onYHK2YR9DUbkmvHOWdMtAVtz02P-MZo5sE3PEOMY__Af3bgwx5NKtA7qIO8w9zxOlv3-aViiL32awB9CT8Bb9inuwoNLqpVJQuSERsZVuFLIUpBItSYA3mrvde9vwxvgWEqfaXzjyIeMh9tum_91VNMdJLVX22UWG_6tlcc0VDTYzzgQGM1kds6An3lvFAemXlzI7fGViGTIE33AgH2kCIdHQihyzHOnPQbu8wkdtW_gw8U0Bb6zQrlMSKMKTSUmiqUo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuACwN4aFZO35aqq10pjCM5JaHPGhczHChF7GLDpdYSprieYW7TRu2Th0NGa-Scg0OSpOyIyP_-QyTM2vsRaTGug-YgjQ4Q3HYRiU50hNmmyTkcRXJjZwXeQEY9zuM-FOCH2rFvNNNYCrbvoN6EundXa9HNxgkpXa6rnntuG5xvo8z0N5LOrELxXoVWgZnezrWwosnh8DQC9OPQHTtkp4IdOb8Fu7L7oDPNaw0P8ZXFGgVJuLyPgPsQdNuo8Wprz6C4BkmuMZwj4_hM',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwa_GuT6ZJeCpe9aRt-cXZ6HvsWLpC5FBL3O_k4r466VPrdaG_pfS8yO62AIw57YQCHgyFuaB2BC38ZnOAdFsF49hLpEXPZP8ThwWnwb428GGnHmxI4YV0JI9e-Yk35aGel_ta8JV9-v-741TdAInYj5Vu2XxZrzitxw7oEq2OzMU_yvpi5mhVdJP3jLk2FqTyGp9UFDbYghEkdTaYuqyl1NIBmEg_mfJtfQdi76PHmKyAEPJ-IAm6WMSR3xG6B6Bf65M3EiT-7CE',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDiK06iJwx4kOnIg7XS-ji0WDAoIX6HD8OWh9UZbVzWhJtKigorP_-jUwTlQ0ZrKdPe8lNlr2bwJQ3w8Ng-geO4_FdsQCCrdg9qDLTTLtv2_9KUH9ADpLcUZXLTjim4DVNmZY7WOO-OtHHM5RRiFmmQqbX7dM-IO08KNInNMQLqHf_KS9W5r-f-bHTFT1oO1xMQz38JO5ouXiyxVgg57UxQ2JPM2IdyJ3DFOc6jVVN5JirU4dIniqwjujnSC3xD4AsE6agxDQ0qqd0',
  ],
  craftStory:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDywvuZzD6s8H567_8sWyDEdivKTQi5o1lfN0AtExgLBAtGC3NTFj50S5BLvgobypVxlDGo1FuLa8pl9fxhR7Z2sHKghbjWnDo-g0dtyp9eVjbu1sbfFX2ztH4wxmKrXYQmIiU7ejmmxKtDUVLzvlllwFnBh5mPZtK_4O8hPjKUOu9BdMFHQgWDiL9iJNoHPyRA-0LGSNuTjBHsj-iGEeufyhkMiyk_UW2BYBc4xlYv1MM7Fqy0CGYwjf_DbYtoG304CRE1P6JUyc0',
  related: [
    {
      title: 'Wooden Salad Servers',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDS7tYNkGZvoD-q6ll6XLd0JVX2UYKgvBbjUCok5zir2N8uXxc_k6_6ctdaVx3CMv6nF6X1yiModp8f4uJbfE7KuOhr17rBhTexZti1UKAVapc-qbZnXww-cZCwateY9WNVb4bPIbtHAsQosacEMNf-zxzu9mBPvIfs-M-t1M_NRilA77nslBUlPzEGykXAA3WsINEoq614UCbK-D8YjTjFaywkfxPOQg6qSwQBRjBruEaV_7LkCDpKzvcfe6sGIYP2ZXheR9YZKTE',
    },
    {
      title: 'Glass Tumblers',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCpLQhl7MvA7rKMoJ4uV4nPgpnEFEOQaXsnWN_cqcIhqwXVs1_QXyvOP3FfiIrfBKpkN7PIUge_sqbF8AgfT-hkixiJFP9-qiAIAHEaLBTF3Akscy0rS7dACDipkcVTIT0gR0HTzxSzUKAdiHZ8g5CsxKFqD0oI4hhTTflKREYCpN2Px-NTv9wDG54A3kbENq256Pe86Kt4FZQCRIkqABXKp-RI8t62xvmOQYFc3xmAgGPD-a3bjZPeZ2DLTYfl1R4_M3mq0sa5kYo',
    },
    {
      title: 'Linen Table Runner',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDzuLPsF8pDeNmndz3cz2ZED1MiWSY48Vn2BPj3NxhBXyM6N3JYrrqesurhnrkbVjj4UQwJUXS50E7DGzrfkCeszxqD8WsEFGFPukD-mrdbWmTT6rlfOw9at1IeSDszVbRK8dy6JqqFY-CGuexjNGdUEZ7oDsH6CI9U1XoN8mX4pYWk6IWab2yReR6Z641H4BL8CHZoB22zY75Wgq9wa2bOF2A6ofIfU5-AXTXju1aL5aIH0kHzJcYYrEgNBvvynNElbvslBHCZeJU',
    },
    {
      title: 'Metal Candle Holder',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAKQPZQNsm7__kH-tmjeh3KtJaqF7dphGPF-rDHPxrTxywRoHDYLjtYMk6zR_aEBeFdNF4_NdKANRD3NMLN20UiXLVw58RjDJTQDdA8dBZJddcMd60ENWuaUZIRxzyK_Bq5nuwlxLiKWrHgGf6lrJuOQrSSzjrdfwdkpRa7FtltJKyCVA-WBUVIdr5nYEsl9JOd2-XEmtwWIOrxG0V3j4-Q8AiBlb9iK_yTz68Gkffr8Z8rmk13Sn394_UWavpXrgjSqCTfxX3VpbU',
    },
  ],
};

export function getProductBySlug(slug) {
  if (!slug) return PRODUCTS[0];
  if (CERAMIC_PRODUCT.slug === slug) return CERAMIC_PRODUCT;
  return PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
}
