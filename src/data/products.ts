import type { Product } from "@/lib/types";

const img = (slug: string) => [
  `/products/${slug}-1.svg`,
  `/products/${slug}-2.svg`,
  `/products/${slug}-3.svg`,
];

export const products: Product[] = [
  {
    id: "lmc-001",
    slug: "labial-satinado-cloud-kiss",
    name: "Labial Satinado Cloud Kiss",
    tagline: "Acabado satinado · 3.8 g",
    category: "maquillaje",
    subcategory: "Labios",
    price: 48900,
    compareAtPrice: 62900,
    images: img("labial-satinado-cloud-kiss"),
    shades: [
      { name: "Nube Rosa", hex: "#F8B6C8" },
      { name: "Durazno Tibio", hex: "#F7D7C4" },
      { name: "Rosa Leche", hex: "#FCD6E2" },
      { name: "Malva Suave", hex: "#DCCEF5" },
    ],
    rating: 4.9,
    reviewsCount: 214,
    stock: 24,
    isBestseller: true,
    isFavorite: true,
    description:
      "El labial que se siente como bálsamo y se ve como labial. Se desliza en una sola pasada, deja un satinado jugoso y no marca las líneas de los labios. Pensado para usar sin espejo, en la fila del bus o antes de entrar a clase.",
    highlights: [
      "Se difumina con el dedo sin quedar en parches",
      "6 horas de color con un solo retoque",
      "No reseca: lleva manteca de karité y vitamina E",
      "Empaque recargable",
    ],
    ingredients:
      "Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Cera Alba, Simmondsia Chinensis (Jojoba) Seed Oil, Tocopherol (Vitamina E), Squalane vegetal, Mica, CI 15850, CI 77891. Libre de parabenos y fragancia sintética. No testeado en animales.",
    howTo: [
      "Aplica desde el centro del labio hacia las esquinas.",
      "Presiona los labios una vez para asentar el color.",
      "Para un efecto difuminado, da golpecitos con el dedo anular.",
      "Retoca el centro después de comer para revivir el brillo.",
    ],
    faqs: [
      { q: "¿Se transfiere a la mascarilla o al vaso?", a: "Un poquito el primer minuto. Si presionas con un pañuelo después de aplicar, se fija mucho mejor." },
      { q: "¿Sirve si tengo los labios resecos?", a: "Sí, es de los pocos labiales que puedes usar sin bálsamo debajo porque la base es de manteca de karité." },
    ],
    tags: ["labial", "lipstick", "labios", "satinado", "rosa", "bestseller"],
  },
  {
    id: "lmc-002",
    slug: "gloss-espejo-glass-petal",
    name: "Gloss Espejo Glass Petal",
    tagline: "Brillo espejo · 6 ml",
    category: "maquillaje",
    subcategory: "Labios",
    price: 39900,
    images: img("gloss-espejo-glass-petal"),
    shades: [
      { name: "Transparente", hex: "#FFF7F4" },
      { name: "Rosa Vidrio", hex: "#FCD6E2" },
      { name: "Durazno", hex: "#F7D7C4" },
    ],
    rating: 4.8,
    reviewsCount: 168,
    stock: 31,
    isBestseller: true,
    description:
      "Brillo de acabado espejo, sin esa sensación pegajosa que hace que el cabello se te quede pegado. Se siente como agua y se ve como vidrio. Nuestro aplicador de gota reparte la cantidad justa.",
    highlights: [
      "Nada pegajoso: fórmula de silicona liviana",
      "Aplicador de gota que no desperdicia producto",
      "Se puede usar solo o encima del labial",
      "Con aceite de semilla de frambuesa",
    ],
    ingredients:
      "Hydrogenated Polyisobutene, Polybutene, Rubus Idaeus (Raspberry) Seed Oil, Silica Dimethyl Silylate, Tocopherol, Aroma natural de vainilla, Mica. Sin gluten. Vegano.",
    howTo: [
      "Aplica una capa fina desde el centro hacia afuera.",
      "Úsalo solo para un look natural de piel limpia.",
      "Encima del labial mate, transforma el acabado en jugoso.",
    ],
    faqs: [{ q: "¿Tiene sabor?", a: "Un aroma muy leve a vainilla, sin sabor dulce artificial." }],
    tags: ["gloss", "brillo", "labios", "espejo", "glass"],
  },
  {
    id: "lmc-003",
    slug: "rubor-en-crema-blush-nube",
    name: "Rubor en Crema Blush Nube",
    tagline: "Crema a polvo · 5 g",
    category: "maquillaje",
    subcategory: "Rostro",
    price: 44900,
    images: img("rubor-en-crema-blush-nube"),
    shades: [
      { name: "Nube", hex: "#F8B6C8" },
      { name: "Durazno Suave", hex: "#F7D7C4" },
      { name: "Lila Tímida", hex: "#DCCEF5" },
    ],
    rating: 4.9,
    reviewsCount: 132,
    stock: 18,
    isFavorite: true,
    description:
      "Empieza en crema y termina en polvo, así que el rubor se ve parte de la piel y no encima de ella. Un toque en cada cachete y ya tienes ese color de haber caminado bajo el sol.",
    highlights: [
      "Se difumina con los dedos, sin brocha",
      "Sirve también en párpados y labios",
      "Acabado natural, nunca polvoso",
      "Espejo integrado en la tapa",
    ],
    ingredients:
      "Caprylic/Capric Triglyceride, Silica, Squalane, Cera Microcristalina, Bisabolol, Tocopherol, Mica, CI 77491. Dermatológicamente testeado. Vegano.",
    howTo: [
      "Toma producto con la punta del dedo (poquito, rinde muchísimo).",
      "Da golpecitos en la parte alta del pómulo.",
      "Difumina hacia la sien con movimientos suaves.",
      "Repite si quieres más intensidad.",
    ],
    tags: ["rubor", "blush", "crema", "rostro", "mejillas"],
  },
  {
    id: "lmc-004",
    slug: "paleta-sombras-pastel-diary",
    name: "Paleta de Sombras Pastel Diary",
    tagline: "8 tonos · edición cuaderno",
    category: "maquillaje",
    subcategory: "Ojos",
    price: 89900,
    compareAtPrice: 109900,
    images: img("paleta-sombras-pastel-diary"),
    rating: 4.7,
    reviewsCount: 97,
    stock: 12,
    isNew: true,
    isBestseller: true,
    description:
      "Ocho tonos pensados como una página de diario: cuatro mates neutros, tres satinados pastel y un iluminador dorado suave. Todos combinan entre sí, así que no hay manera de equivocarse.",
    highlights: [
      "Pigmentación construible: de sutil a definido",
      "Mates que se difuminan sin esfuerzo",
      "Empaque con espejo grande",
      "Sin caída de producto (fallout)",
    ],
    ingredients:
      "Talc, Mica, Magnesium Stearate, Dimethicone, Caprylic/Capric Triglyceride, Tocopherol, CI 77491, CI 77492, CI 77499, CI 77891. Libre de parabenos.",
    howTo: [
      "Aplica el tono más claro en todo el párpado como base.",
      "Usa un mate medio en la cuenca para dar profundidad.",
      "Difumina los bordes con una brocha limpia.",
      "Termina con el satinado dorado en el centro del párpado.",
    ],
    faqs: [
      { q: "¿Sirve para piel morena?", a: "Sí. Los satinados se ven especialmente lindos en pieles medias y morenas porque el pastel contrasta." },
    ],
    tags: ["paleta", "sombras", "ojos", "pastel", "nuevo"],
  },
  {
    id: "lmc-005",
    slug: "bruma-fijadora-dewy-mist",
    name: "Bruma Fijadora Dewy Mist",
    tagline: "Fija y refresca · 100 ml",
    category: "maquillaje",
    subcategory: "Fijadores",
    price: 52900,
    images: img("bruma-fijadora-dewy-mist"),
    rating: 4.8,
    reviewsCount: 143,
    stock: 27,
    description:
      "Bruma finísima que fija el maquillaje y deja la piel con ese acabado húmedo bonito. En el clima de Medellín es prácticamente obligatoria: refresca a mediodía sin dañar la base.",
    highlights: [
      "Difusor de niebla fina, no gotea",
      "Con agua de rosas y pantenol",
      "También se usa antes del maquillaje",
      "Aguanta el calor y la humedad",
    ],
    ingredients:
      "Aqua, Rosa Damascena Flower Water, Glycerin, Panthenol, Sodium Hyaluronate, Allantoin, Aloe Barbadensis Leaf Juice, Phenoxyethanol. Sin alcohol.",
    howTo: [
      "Agita suavemente antes de usar.",
      "Rocía a 25 cm del rostro formando una X.",
      "Deja secar al aire, sin tocar.",
      "Reaplica a lo largo del día para revivir la piel.",
    ],
    tags: ["bruma", "fijador", "spray", "setting", "rostro"],
  },
  {
    id: "lmc-006",
    slug: "base-luminosa-soft-focus",
    name: "Base Luminosa Soft Focus",
    tagline: "Cobertura media · 30 ml",
    category: "maquillaje",
    subcategory: "Rostro",
    price: 79900,
    images: img("base-luminosa-soft-focus"),
    shades: [
      { name: "Crema 10", hex: "#FBE9E0" },
      { name: "Arena 20", hex: "#F7D7C4" },
      { name: "Miel 30", hex: "#F4D58D" },
      { name: "Canela 40", hex: "#E5B192" },
    ],
    rating: 4.6,
    reviewsCount: 88,
    stock: 21,
    isNew: true,
    description:
      "Una base que difumina la textura sin borrar tu piel. Cobertura media construible con acabado satinado, del tipo que hace que te pregunten qué skincare usas.",
    highlights: [
      "Dosificador de gotero: controlas la cantidad",
      "No se oxida ni se pone naranja",
      "Con niacinamida al 2%",
      "Se puede mezclar con hidratante para menos cobertura",
    ],
    ingredients:
      "Aqua, Dimethicone, Glycerin, Niacinamide, Sodium Hyaluronate, Squalane, Tocopherol, Titanium Dioxide, Iron Oxides, Phenoxyethanol. No comedogénica.",
    howTo: [
      "Agita y aplica 2 o 3 gotas en el dorso de la mano.",
      "Difumina con esponja húmeda desde el centro del rostro.",
      "Construye cobertura solo donde la necesites.",
      "Fija con Dewy Mist para que dure más.",
    ],
    tags: ["base", "foundation", "rostro", "cobertura", "nuevo"],
  },
  {
    id: "lmc-007",
    slug: "mascara-pestanas-bunny-lash",
    name: "Máscara de Pestañas Bunny Lash",
    tagline: "Volumen y curva · 9 ml",
    category: "maquillaje",
    subcategory: "Ojos",
    price: 46900,
    images: img("mascara-pestanas-bunny-lash"),
    rating: 4.7,
    reviewsCount: 156,
    stock: 29,
    isBestseller: true,
    description:
      "Cepillo curvo pequeño que alcanza hasta la última pestaña del lagrimal. Da volumen sin grumos y mantiene la curva todo el día, incluso si te da sueño y te tallas el ojo.",
    highlights: [
      "No se corre ni deja sombras bajo los ojos",
      "Se retira con agua tibia, sin desmaquillante fuerte",
      "Cepillo curvo de fibras cortas",
      "Con péptidos que cuidan la pestaña",
    ],
    ingredients:
      "Aqua, Cera Alba, Copernicia Cerifera (Carnauba) Wax, Acacia Senegal Gum, Panthenol, Biotinoyl Tripeptide-1, Iron Oxides. Oftalmológicamente testeado. Apta para lentes de contacto.",
    howTo: [
      "Apoya el cepillo en la raíz y muévelo en zigzag.",
      "Aplica una segunda capa antes de que seque la primera.",
      "Para las pestañas inferiores, usa la punta del cepillo.",
    ],
    tags: ["mascara", "pestañas", "ojos", "volumen"],
  },
  {
    id: "lmc-008",
    slug: "delineador-kitten-line",
    name: "Delineador Kitten Line",
    tagline: "Punta pincel · negro suave",
    category: "maquillaje",
    subcategory: "Ojos",
    price: 34900,
    images: img("delineador-kitten-line"),
    rating: 4.5,
    reviewsCount: 74,
    stock: 33,
    description:
      "Punta de pincel flexible que hace la línea finita del lagrimal y se abre para el rabito. Negro suave, no azulado, para que combine con el maquillaje pastel.",
    highlights: [
      "Punta de 0.1 mm que no se abre con el uso",
      "Secado en 8 segundos",
      "Resistente al sudor",
      "Se corrige con un cotonete húmedo",
    ],
    ingredients:
      "Aqua, Butylene Glycol, Acrylates Copolymer, Panthenol, CI 77499, Phenoxyethanol. Vegano.",
    howTo: [
      "Apoya el codo en la mesa: pulso firme, línea firme.",
      "Traza pequeños guiones y luego únelos.",
      "Para el rabito, sigue la línea imaginaria de la pestaña inferior.",
    ],
    tags: ["delineador", "eyeliner", "ojos", "negro"],
  },
  {
    id: "lmc-009",
    slug: "iluminador-liquido-angel-drop",
    name: "Iluminador Líquido Angel Drop",
    tagline: "Gota de luz · 15 ml",
    category: "maquillaje",
    subcategory: "Rostro",
    price: 42900,
    images: img("iluminador-liquido-angel-drop"),
    shades: [
      { name: "Perla", hex: "#FFF7F4" },
      { name: "Champaña", hex: "#F4D58D" },
      { name: "Rosado", hex: "#F8B6C8" },
    ],
    rating: 4.9,
    reviewsCount: 121,
    stock: 16,
    isFavorite: true,
    description:
      "Luz líquida sin glitter visible. Una gota en el puente de la nariz y arriba del pómulo cambia toda la cara. También se puede mezclar con la base para un efecto de piel mojada.",
    highlights: [
      "Brillo satinado, sin partículas grandes",
      "Se mezcla con base o hidratante",
      "Rinde meses: se usa muy poquito",
      "Se ve bonito en todos los tonos de piel",
    ],
    ingredients:
      "Aqua, Glycerin, Dimethicone, Synthetic Fluorphlogopite, Squalane, Sodium Hyaluronate, Tocopherol, Phenoxyethanol.",
    howTo: [
      "Aplica una gota en la parte alta del pómulo.",
      "Difumina con el dedo hacia la sien.",
      "Añade un toque en el arco de cupido y el puente nasal.",
    ],
    tags: ["iluminador", "highlighter", "glow", "rostro", "favorito"],
  },
  {
    id: "lmc-010",
    slug: "corrector-second-skin",
    name: "Corrector Second Skin",
    tagline: "Cremoso, no se cuartea · 7 ml",
    category: "maquillaje",
    subcategory: "Rostro",
    price: 38900,
    images: img("corrector-second-skin"),
    shades: [
      { name: "Claro", hex: "#FBE9E0" },
      { name: "Medio", hex: "#F7D7C4" },
      { name: "Medio Cálido", hex: "#F4D58D" },
      { name: "Oscuro", hex: "#E5B192" },
    ],
    rating: 4.6,
    reviewsCount: 109,
    stock: 25,
    description:
      "Corrector cremoso que cubre la ojera sin acumularse en las líneas de expresión. Con un toque de melocotón para neutralizar el morado del desvelo.",
    highlights: [
      "No se cuartea ni se marca en las arruguitas",
      "Base con cafeína que desinflama",
      "Aplicador de esponja suave",
      "Cobertura media construible",
    ],
    ingredients:
      "Aqua, Dimethicone, Glycerin, Caffeine, Squalane, Tocopherol, Titanium Dioxide, Iron Oxides, Phenoxyethanol.",
    howTo: [
      "Aplica tres puntos en triángulo bajo el ojo.",
      "Difumina con golpecitos, nunca arrastrando.",
      "Sella con polvo traslúcido solo si te marca.",
    ],
    tags: ["corrector", "concealer", "ojeras", "rostro"],
  },
  {
    id: "lmc-011",
    slug: "labial-mate-milky-rose",
    name: "Labial Mate Milky Rose",
    tagline: "Mate cremoso · 3.5 g",
    category: "maquillaje",
    subcategory: "Labios",
    price: 46900,
    images: img("labial-mate-milky-rose"),
    shades: [
      { name: "Rosa Lechoso", hex: "#FCD6E2" },
      { name: "Terracota Suave", hex: "#E5B192" },
      { name: "Vino Pastel", hex: "#E38FA8" },
    ],
    rating: 4.7,
    reviewsCount: 93,
    stock: 22,
    description:
      "Mate que no reseca, que es prácticamente un oxímoron. Se siente en polvo pero deja el labio flexible. Perfecto para días largos de universidad u oficina.",
    highlights: [
      "8 horas de duración real",
      "Mate suave, no acartonado",
      "Con aceite de coco y ceramidas",
      "Se puede difuminar para efecto mordido",
    ],
    ingredients:
      "Cocos Nucifera (Coconut) Oil, Isododecane, Cera Alba, Ceramide NP, Tocopherol, Silica, Mica, CI 15850, CI 77891.",
    howTo: [
      "Delinea el contorno y rellena hacia adentro.",
      "Presiona con un pañuelo y reaplica una capa fina.",
      "Para efecto mordido, difumina los bordes con el dedo.",
    ],
    tags: ["labial", "mate", "labios", "rosa"],
  },
  {
    id: "lmc-012",
    slug: "polvo-suelto-baby-blur",
    name: "Polvo Suelto Baby Blur",
    tagline: "Traslúcido · 8 g",
    category: "maquillaje",
    subcategory: "Rostro",
    price: 41900,
    images: img("polvo-suelto-baby-blur"),
    rating: 4.5,
    reviewsCount: 67,
    stock: 19,
    description:
      "Polvo finísimo que difumina el brillo sin dejar esa capa blanca en las fotos con flash. Sella el maquillaje y deja la piel con textura de durazno.",
    highlights: [
      "Sin flashback blanco",
      "Traslúcido: funciona en todos los tonos",
      "Frasco con tamiz para no desperdiciar",
      "Con almidón de arroz",
    ],
    ingredients:
      "Oryza Sativa (Rice) Starch, Silica, Mica, Zea Mays Starch, Tocopherol, Boron Nitride.",
    howTo: [
      "Toma poquito producto con brocha esponjada.",
      "Presiona en la zona T y bajo los ojos.",
      "Retira el exceso con una brocha limpia.",
    ],
    tags: ["polvo", "traslucido", "rostro", "sellar"],
  },
  {
    id: "lmc-013",
    slug: "serum-calmante-petal-water",
    name: "Serum Calmante Petal Water",
    tagline: "Rojeces y barrera · 30 ml",
    category: "skincare",
    subcategory: "Serums",
    price: 74900,
    images: img("serum-calmante-petal-water"),
    rating: 4.9,
    reviewsCount: 118,
    stock: 14,
    isNew: true,
    isFavorite: true,
    description:
      "Para la piel que se pone roja con todo. Centella asiática y pantenol para calmar, más ácido hialurónico de bajo peso para hidratar de verdad. Textura de agua, absorción inmediata.",
    highlights: [
      "Calma rojeces en pocos días",
      "Se puede usar mañana y noche",
      "Sin fragancia ni alcohol",
      "Compatible con retinol y vitamina C",
    ],
    ingredients:
      "Aqua, Centella Asiatica Extract (5%), Panthenol (3%), Sodium Hyaluronate, Glycerin, Madecassoside, Allantoin, Beta-Glucan, Phenoxyethanol. Apto para piel sensible.",
    howTo: [
      "Sobre el rostro limpio y húmedo, aplica 3 o 4 gotas.",
      "Presiona con las palmas, sin frotar.",
      "Sigue con tu hidratante para sellar.",
      "De día, termina siempre con protector solar.",
    ],
    faqs: [
      { q: "¿Puedo usarlo si tengo acné?", a: "Sí, es de los pocos serums que no interfiere: calma la irritación que dejan los tratamientos." },
      { q: "¿Se siente pegajoso?", a: "No. Es textura de agua y seca en unos 20 segundos." },
    ],
    tags: ["serum", "skincare", "centella", "rojeces", "nuevo"],
  },
  {
    id: "lmc-014",
    slug: "balsamo-labial-baby-balm",
    name: "Bálsamo Labial Baby Balm",
    tagline: "Reparación nocturna · 15 g",
    category: "skincare",
    subcategory: "Labios",
    price: 29900,
    images: img("balsamo-labial-baby-balm"),
    rating: 4.8,
    reviewsCount: 201,
    stock: 40,
    isBestseller: true,
    description:
      "El tarrito que va en la mesa de noche. Se aplica antes de dormir y al día siguiente los labios están lisos. También funciona de día como brillo transparente.",
    highlights: [
      "Textura densa que no se va con el sudor",
      "Sirve también en cutículas y párpados secos",
      "Sabor neutro, aroma leve a vainilla",
      "Rinde meses",
    ],
    ingredients:
      "Butyrospermum Parkii (Shea) Butter, Cera Alba, Ricinus Communis Seed Oil, Lanolina vegetal, Tocopherol, Bisabolol, Aroma natural de vainilla.",
    howTo: [
      "Toma un poquito con el dedo limpio.",
      "Aplica una capa generosa antes de dormir.",
      "De día, úsalo solo o debajo del labial.",
    ],
    tags: ["balsamo", "labios", "skincare", "reparador", "bestseller"],
  },
  {
    id: "lmc-015",
    slug: "crema-nube-cloud-cream",
    name: "Crema Nube Cloud Cream",
    tagline: "Hidratación liviana · 50 ml",
    category: "skincare",
    subcategory: "Hidratación",
    price: 68900,
    compareAtPrice: 79900,
    images: img("crema-nube-cloud-cream"),
    rating: 4.7,
    reviewsCount: 86,
    stock: 17,
    description:
      "Hidratante en gel-crema que desaparece al tocar la piel. Ideal para el clima húmedo: hidrata sin ese peso graso que hace sudar la base.",
    highlights: [
      "Textura gel-crema, absorción en segundos",
      "Con ceramidas y escualano",
      "Buena base para el maquillaje",
      "No tapa poros",
    ],
    ingredients:
      "Aqua, Glycerin, Squalane, Ceramide NP, Ceramide AP, Sodium Hyaluronate, Panthenol, Cholesterol, Tocopherol, Phenoxyethanol.",
    howTo: [
      "Aplica una avellana de producto sobre el serum.",
      "Extiende con movimientos hacia arriba.",
      "Usa mañana y noche.",
    ],
    tags: ["crema", "hidratante", "skincare", "ceramidas"],
  },
  {
    id: "lmc-016",
    slug: "set-brochas-cloud-brush",
    name: "Set de Brochas Cloud Brush",
    tagline: "5 piezas · fibra vegana",
    category: "accesorios",
    subcategory: "Brochas",
    price: 94900,
    compareAtPrice: 124900,
    images: img("set-brochas-cloud-brush"),
    rating: 4.8,
    reviewsCount: 79,
    stock: 11,
    isBestseller: true,
    description:
      "Cinco brochas que cubren todo: base, corrector, rubor, sombra y difuminado. Fibra sintética suavísima que no bota pelo y se lava en un minuto.",
    highlights: [
      "Mango de madera clara con detalle dorado",
      "No absorbe producto de más",
      "Incluye estuche de viaje",
      "Fibra vegana, cruelty free",
    ],
    ingredients:
      "Fibra sintética Taklon, mango de madera FSC, virola de aluminio. Libre de pelo animal.",
    howTo: [
      "Lava con jabón neutro una vez por semana.",
      "Sécalas boca abajo o acostadas, nunca de punta hacia arriba.",
      "Guárdalas en el estuche cuando viajes.",
    ],
    tags: ["brochas", "set", "accesorios", "brushes"],
  },
  {
    id: "lmc-017",
    slug: "espejo-bolsillo-mirror-mirror",
    name: "Espejo de Bolsillo Mirror Mirror",
    tagline: "Doble cara · con aumento",
    category: "accesorios",
    subcategory: "Espejos",
    price: 32900,
    images: img("espejo-bolsillo-mirror-mirror"),
    rating: 4.6,
    reviewsCount: 64,
    stock: 26,
    description:
      "Espejo compacto con una cara normal y otra con aumento 2x, en carcasa color crema con relieve de flor. Del tamaño exacto para que quepa en cualquier cartera.",
    highlights: [
      "Cierre firme que no se abre en el bolso",
      "Aumento 2x para delinear",
      "Carcasa mate que no se raya",
      "Viene en bolsita de tela",
    ],
    ingredients: "Carcasa de ABS reciclado, espejo de vidrio templado, bolsita de algodón.",
    howTo: [
      "Usa la cara plana para revisar el maquillaje.",
      "Usa el aumento 2x para cejas y delineado.",
      "Limpia con un paño de microfibra seco.",
    ],
    tags: ["espejo", "accesorios", "bolsillo", "compacto"],
  },
  {
    id: "lmc-018",
    slug: "cosmetiquera-puffy-pouch",
    name: "Cosmetiquera Puffy Pouch",
    tagline: "Acolchada · talla mediana",
    category: "accesorios",
    subcategory: "Organización",
    price: 58900,
    images: img("cosmetiquera-puffy-pouch"),
    rating: 4.9,
    reviewsCount: 112,
    stock: 15,
    isFavorite: true,
    description:
      "Acolchada, impermeable por dentro y con esa forma redondita que la hace ver como una nube. Cabe una rutina completa de skincare o todo tu maquillaje diario.",
    highlights: [
      "Interior impermeable, fácil de limpiar",
      "Cierre metálico con dije de corazón",
      "Se para sola cuando está llena",
      "Dos bolsillos internos",
    ],
    ingredients: "Exterior de nylon acolchado, interior de TPU impermeable, cierre de aleación de zinc.",
    howTo: [
      "Limpia el interior con un paño húmedo.",
      "No la metas a la lavadora: pierde el acolchado.",
      "Guarda los líquidos en el bolsillo con cierre.",
    ],
    tags: ["cosmetiquera", "organizacion", "accesorios", "pouch", "favorito"],
  },
  {
    id: "lmc-019",
    slug: "cuaderno-notas-cute",
    name: "Cuaderno Notas Cute",
    tagline: "A5 · 160 páginas punteadas",
    category: "papeleria",
    subcategory: "Cuadernos",
    price: 36900,
    images: img("cuaderno-notas-cute"),
    rating: 4.7,
    reviewsCount: 58,
    stock: 20,
    isNew: true,
    description:
      "Papel de 100 g que no traspasa la tinta, hojas punteadas para hacer lo que quieras y tapa dura en lavanda con relieve. Abre completamente plano.",
    highlights: [
      "Papel de 100 g, apto para marcadores",
      "Abre plano, sin pelear con el lomo",
      "Cinta separadora y bolsillo trasero",
      "Tapa dura con relieve de flor",
    ],
    ingredients: "Papel FSC de 100 g, tapa dura forrada, hilo cosido, cinta de raso.",
    howTo: [
      "Úsalo como bullet journal, agenda o diario.",
      "Prueba tus marcadores en la última página.",
      "El bolsillo trasero es perfecto para stickers.",
    ],
    tags: ["cuaderno", "papeleria", "journal", "nuevo"],
  },
  {
    id: "lmc-020",
    slug: "kit-regalo-cute-box",
    name: "Kit Regalo Cute Box",
    tagline: "4 productos · envuelto a mano",
    category: "regalos",
    subcategory: "Kits",
    price: 149900,
    compareAtPrice: 189900,
    images: img("kit-regalo-cute-box"),
    rating: 5,
    reviewsCount: 74,
    stock: 9,
    isBestseller: true,
    isFavorite: true,
    description:
      "Nuestra caja más regalada: labial Cloud Kiss, bálsamo Baby Balm, espejo Mirror Mirror y bruma Dewy Mist, dentro de una caja rígida con papel de seda, sello de cera y tarjeta escrita a mano con tu mensaje.",
    highlights: [
      "Ahorras $40.000 frente a comprarlos por separado",
      "Tarjeta escrita a mano con tu mensaje",
      "Caja rígida reutilizable",
      "Puedes enviarlo directo a la persona",
    ],
    ingredients:
      "Contiene: Labial Satinado Cloud Kiss, Bálsamo Baby Balm, Espejo Mirror Mirror y Bruma Dewy Mist. Ver ingredientes de cada producto en su página.",
    howTo: [
      "Elige el tono del labial en las notas del pedido.",
      "Escríbenos el mensaje para la tarjeta al finalizar la compra.",
      "Si es sorpresa, cuéntanos y no ponemos factura dentro.",
    ],
    faqs: [
      { q: "¿Puedo cambiar un producto del kit?", a: "Sí, escríbenos por WhatsApp antes de pagar y lo armamos a tu gusto." },
      { q: "¿Lo envían directo a quien lo recibe?", a: "Claro. Pon la dirección de esa persona en el checkout y su nombre en las notas." },
    ],
    tags: ["kit", "regalo", "caja", "bestseller", "set"],
  },
  {
    id: "lmc-021",
    slug: "perfume-vanilla-cloud",
    name: "Perfume Vanilla Cloud",
    tagline: "Eau de parfum · 50 ml",
    category: "perfumes",
    subcategory: "Eau de parfum",
    price: 129900,
    images: img("perfume-vanilla-cloud"),
    rating: 4.8,
    reviewsCount: 96,
    stock: 13,
    isNew: true,
    description:
      "Vainilla, almendra y un fondo de almizcle limpio: huele a piel recién bañada, no a postre. Dura entre 6 y 8 horas y deja una estela suave, de las que hacen que te pregunten qué te echaste.",
    highlights: [
      "Notas: vainilla de Madagascar, almendra, almizcle blanco",
      "6 a 8 horas de duración",
      "Frasco de vidrio con tapa dorada suave",
      "Unisex",
    ],
    ingredients:
      "Alcohol Denat., Parfum, Aqua, Benzyl Benzoate, Coumarin, Vanillin, Linalool. Concentración eau de parfum (15%).",
    howTo: [
      "Rocía a 15 cm en muñecas y cuello.",
      "No frotes: rompe las notas de salida.",
      "Aplica sobre piel hidratada para que dure más.",
    ],
    tags: ["perfume", "vainilla", "fragancia", "nuevo"],
  },
  {
    id: "lmc-022",
    slug: "bruma-corporal-sugar-cloud",
    name: "Bruma Corporal Sugar Cloud",
    tagline: "Bruma ligera · 150 ml",
    category: "perfumes",
    subcategory: "Brumas",
    price: 59900,
    images: img("bruma-corporal-sugar-cloud"),
    rating: 4.7,
    reviewsCount: 81,
    stock: 23,
    description:
      "La versión juguetona de Vanilla Cloud, para el cuerpo y el cabello. Más fresca, más ligera, para reaplicar todo el día sin cansar.",
    highlights: [
      "Segura para el cabello: sin alcohol fuerte",
      "Hidrata con glicerina y aloe",
      "Tamaño de cartera",
      "Se puede capear con el perfume",
    ],
    ingredients:
      "Aqua, Glycerin, Parfum, Aloe Barbadensis Leaf Juice, Panthenol, Polysorbate 20, Phenoxyethanol.",
    howTo: [
      "Agita y rocía sobre el cuerpo después de la ducha.",
      "También en el cabello, a 30 cm de distancia.",
      "Reaplica cuando quieras.",
    ],
    tags: ["bruma", "corporal", "perfume", "vainilla"],
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCategory = (category: string) =>
  products.filter((p) => p.category === category);

export const newArrivals = products.filter((p) => p.isNew);
export const bestsellers = products.filter((p) => p.isBestseller);
export const favorites = products.filter((p) => p.isFavorite);

/** Relacionados: misma subcategoría primero, luego misma categoría */
export function relatedProducts(slug: string, limit = 4) {
  const base = productBySlug(slug);
  if (!base) return products.slice(0, limit);
  const scored = products
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      p,
      score:
        (p.subcategory === base.subcategory ? 3 : 0) +
        (p.category === base.category ? 2 : 0) +
        p.tags.filter((t) => base.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating);
  return scored.slice(0, limit).map((s) => s.p);
}

export const priceRange = {
  min: Math.min(...products.map((p) => p.price)),
  max: Math.max(...products.map((p) => p.price)),
};

export const allSubcategories = [...new Set(products.map((p) => p.subcategory))];
