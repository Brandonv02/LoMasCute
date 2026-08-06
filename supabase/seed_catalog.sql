-- ============================================================
-- Lo Más Cute — relleno de la ficha de producto
-- Acompaña a 0004_catalog_fields.sql
--
-- Traslada a Supabase los campos que hasta ahora solo existían en
-- src/data/products.ts: tonos, puntos fuertes, ingredientes, modo de uso,
-- preguntas frecuentes, etiquetas y los tres indicadores de portada.
--
-- Empareja por slug y es idempotente: se puede repetir sin efectos.
-- ============================================================

update public.products set
  shades      = '[{"name":"Nube Rosa","hex":"#F8B6C8"},{"name":"Durazno Tibio","hex":"#F7D7C4"},{"name":"Rosa Leche","hex":"#FCD6E2"},{"name":"Malva Suave","hex":"#DCCEF5"}]'::jsonb,
  highlights  = array['Se difumina con el dedo sin quedar en parches', '6 horas de color con un solo retoque', 'No reseca: lleva manteca de karité y vitamina E', 'Empaque recargable']::text[],
  ingredients = 'Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Cera Alba, Simmondsia Chinensis (Jojoba) Seed Oil, Tocopherol (Vitamina E), Squalane vegetal, Mica, CI 15850, CI 77891. Libre de parabenos y fragancia sintética. No testeado en animales.',
  how_to      = array['Aplica desde el centro del labio hacia las esquinas.', 'Presiona los labios una vez para asentar el color.', 'Para un efecto difuminado, da golpecitos con el dedo anular.', 'Retoca el centro después de comer para revivir el brillo.']::text[],
  faqs        = '[{"q":"¿Se transfiere a la mascarilla o al vaso?","a":"Un poquito el primer minuto. Si presionas con un pañuelo después de aplicar, se fija mucho mejor."},{"q":"¿Sirve si tengo los labios resecos?","a":"Sí, es de los pocos labiales que puedes usar sin bálsamo debajo porque la base es de manteca de karité."}]'::jsonb,
  tags        = array['labial', 'lipstick', 'labios', 'satinado', 'rosa', 'bestseller']::text[],
  is_featured = true,
  is_new      = false,
  is_favorite = true
where slug = 'labial-satinado-cloud-kiss';

update public.products set
  shades      = '[{"name":"Transparente","hex":"#FFF7F4"},{"name":"Rosa Vidrio","hex":"#FCD6E2"},{"name":"Durazno","hex":"#F7D7C4"}]'::jsonb,
  highlights  = array['Nada pegajoso: fórmula de silicona liviana', 'Aplicador de gota que no desperdicia producto', 'Se puede usar solo o encima del labial', 'Con aceite de semilla de frambuesa']::text[],
  ingredients = 'Hydrogenated Polyisobutene, Polybutene, Rubus Idaeus (Raspberry) Seed Oil, Silica Dimethyl Silylate, Tocopherol, Aroma natural de vainilla, Mica. Sin gluten. Vegano.',
  how_to      = array['Aplica una capa fina desde el centro hacia afuera.', 'Úsalo solo para un look natural de piel limpia.', 'Encima del labial mate, transforma el acabado en jugoso.']::text[],
  faqs        = '[{"q":"¿Tiene sabor?","a":"Un aroma muy leve a vainilla, sin sabor dulce artificial."}]'::jsonb,
  tags        = array['gloss', 'brillo', 'labios', 'espejo', 'glass']::text[],
  is_featured = true,
  is_new      = false,
  is_favorite = false
where slug = 'gloss-espejo-glass-petal';

update public.products set
  shades      = '[{"name":"Nube","hex":"#F8B6C8"},{"name":"Durazno Suave","hex":"#F7D7C4"},{"name":"Lila Tímida","hex":"#DCCEF5"}]'::jsonb,
  highlights  = array['Se difumina con los dedos, sin brocha', 'Sirve también en párpados y labios', 'Acabado natural, nunca polvoso', 'Espejo integrado en la tapa']::text[],
  ingredients = 'Caprylic/Capric Triglyceride, Silica, Squalane, Cera Microcristalina, Bisabolol, Tocopherol, Mica, CI 77491. Dermatológicamente testeado. Vegano.',
  how_to      = array['Toma producto con la punta del dedo (poquito, rinde muchísimo).', 'Da golpecitos en la parte alta del pómulo.', 'Difumina hacia la sien con movimientos suaves.', 'Repite si quieres más intensidad.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['rubor', 'blush', 'crema', 'rostro', 'mejillas']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = true
where slug = 'rubor-en-crema-blush-nube';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Pigmentación construible: de sutil a definido', 'Mates que se difuminan sin esfuerzo', 'Empaque con espejo grande', 'Sin caída de producto (fallout)']::text[],
  ingredients = 'Talc, Mica, Magnesium Stearate, Dimethicone, Caprylic/Capric Triglyceride, Tocopherol, CI 77491, CI 77492, CI 77499, CI 77891. Libre de parabenos.',
  how_to      = array['Aplica el tono más claro en todo el párpado como base.', 'Usa un mate medio en la cuenca para dar profundidad.', 'Difumina los bordes con una brocha limpia.', 'Termina con el satinado dorado en el centro del párpado.']::text[],
  faqs        = '[{"q":"¿Sirve para piel morena?","a":"Sí. Los satinados se ven especialmente lindos en pieles medias y morenas porque el pastel contrasta."}]'::jsonb,
  tags        = array['paleta', 'sombras', 'ojos', 'pastel', 'nuevo']::text[],
  is_featured = true,
  is_new      = true,
  is_favorite = false
where slug = 'paleta-sombras-pastel-diary';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Difusor de niebla fina, no gotea', 'Con agua de rosas y pantenol', 'También se usa antes del maquillaje', 'Aguanta el calor y la humedad']::text[],
  ingredients = 'Aqua, Rosa Damascena Flower Water, Glycerin, Panthenol, Sodium Hyaluronate, Allantoin, Aloe Barbadensis Leaf Juice, Phenoxyethanol. Sin alcohol.',
  how_to      = array['Agita suavemente antes de usar.', 'Rocía a 25 cm del rostro formando una X.', 'Deja secar al aire, sin tocar.', 'Reaplica a lo largo del día para revivir la piel.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['bruma', 'fijador', 'spray', 'setting', 'rostro']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'bruma-fijadora-dewy-mist';

update public.products set
  shades      = '[{"name":"Crema 10","hex":"#FBE9E0"},{"name":"Arena 20","hex":"#F7D7C4"},{"name":"Miel 30","hex":"#F4D58D"},{"name":"Canela 40","hex":"#E5B192"}]'::jsonb,
  highlights  = array['Dosificador de gotero: controlas la cantidad', 'No se oxida ni se pone naranja', 'Con niacinamida al 2%', 'Se puede mezclar con hidratante para menos cobertura']::text[],
  ingredients = 'Aqua, Dimethicone, Glycerin, Niacinamide, Sodium Hyaluronate, Squalane, Tocopherol, Titanium Dioxide, Iron Oxides, Phenoxyethanol. No comedogénica.',
  how_to      = array['Agita y aplica 2 o 3 gotas en el dorso de la mano.', 'Difumina con esponja húmeda desde el centro del rostro.', 'Construye cobertura solo donde la necesites.', 'Fija con Dewy Mist para que dure más.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['base', 'foundation', 'rostro', 'cobertura', 'nuevo']::text[],
  is_featured = false,
  is_new      = true,
  is_favorite = false
where slug = 'base-luminosa-soft-focus';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['No se corre ni deja sombras bajo los ojos', 'Se retira con agua tibia, sin desmaquillante fuerte', 'Cepillo curvo de fibras cortas', 'Con péptidos que cuidan la pestaña']::text[],
  ingredients = 'Aqua, Cera Alba, Copernicia Cerifera (Carnauba) Wax, Acacia Senegal Gum, Panthenol, Biotinoyl Tripeptide-1, Iron Oxides. Oftalmológicamente testeado. Apta para lentes de contacto.',
  how_to      = array['Apoya el cepillo en la raíz y muévelo en zigzag.', 'Aplica una segunda capa antes de que seque la primera.', 'Para las pestañas inferiores, usa la punta del cepillo.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['mascara', 'pestañas', 'ojos', 'volumen']::text[],
  is_featured = true,
  is_new      = false,
  is_favorite = false
where slug = 'mascara-pestanas-bunny-lash';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Punta de 0.1 mm que no se abre con el uso', 'Secado en 8 segundos', 'Resistente al sudor', 'Se corrige con un cotonete húmedo']::text[],
  ingredients = 'Aqua, Butylene Glycol, Acrylates Copolymer, Panthenol, CI 77499, Phenoxyethanol. Vegano.',
  how_to      = array['Apoya el codo en la mesa: pulso firme, línea firme.', 'Traza pequeños guiones y luego únelos.', 'Para el rabito, sigue la línea imaginaria de la pestaña inferior.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['delineador', 'eyeliner', 'ojos', 'negro']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'delineador-kitten-line';

update public.products set
  shades      = '[{"name":"Perla","hex":"#FFF7F4"},{"name":"Champaña","hex":"#F4D58D"},{"name":"Rosado","hex":"#F8B6C8"}]'::jsonb,
  highlights  = array['Brillo satinado, sin partículas grandes', 'Se mezcla con base o hidratante', 'Rinde meses: se usa muy poquito', 'Se ve bonito en todos los tonos de piel']::text[],
  ingredients = 'Aqua, Glycerin, Dimethicone, Synthetic Fluorphlogopite, Squalane, Sodium Hyaluronate, Tocopherol, Phenoxyethanol.',
  how_to      = array['Aplica una gota en la parte alta del pómulo.', 'Difumina con el dedo hacia la sien.', 'Añade un toque en el arco de cupido y el puente nasal.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['iluminador', 'highlighter', 'glow', 'rostro', 'favorito']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = true
where slug = 'iluminador-liquido-angel-drop';

update public.products set
  shades      = '[{"name":"Claro","hex":"#FBE9E0"},{"name":"Medio","hex":"#F7D7C4"},{"name":"Medio Cálido","hex":"#F4D58D"},{"name":"Oscuro","hex":"#E5B192"}]'::jsonb,
  highlights  = array['No se cuartea ni se marca en las arruguitas', 'Base con cafeína que desinflama', 'Aplicador de esponja suave', 'Cobertura media construible']::text[],
  ingredients = 'Aqua, Dimethicone, Glycerin, Caffeine, Squalane, Tocopherol, Titanium Dioxide, Iron Oxides, Phenoxyethanol.',
  how_to      = array['Aplica tres puntos en triángulo bajo el ojo.', 'Difumina con golpecitos, nunca arrastrando.', 'Sella con polvo traslúcido solo si te marca.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['corrector', 'concealer', 'ojeras', 'rostro']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'corrector-second-skin';

update public.products set
  shades      = '[{"name":"Rosa Lechoso","hex":"#FCD6E2"},{"name":"Terracota Suave","hex":"#E5B192"},{"name":"Vino Pastel","hex":"#E38FA8"}]'::jsonb,
  highlights  = array['8 horas de duración real', 'Mate suave, no acartonado', 'Con aceite de coco y ceramidas', 'Se puede difuminar para efecto mordido']::text[],
  ingredients = 'Cocos Nucifera (Coconut) Oil, Isododecane, Cera Alba, Ceramide NP, Tocopherol, Silica, Mica, CI 15850, CI 77891.',
  how_to      = array['Delinea el contorno y rellena hacia adentro.', 'Presiona con un pañuelo y reaplica una capa fina.', 'Para efecto mordido, difumina los bordes con el dedo.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['labial', 'mate', 'labios', 'rosa']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'labial-mate-milky-rose';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Sin flashback blanco', 'Traslúcido: funciona en todos los tonos', 'Frasco con tamiz para no desperdiciar', 'Con almidón de arroz']::text[],
  ingredients = 'Oryza Sativa (Rice) Starch, Silica, Mica, Zea Mays Starch, Tocopherol, Boron Nitride.',
  how_to      = array['Toma poquito producto con brocha esponjada.', 'Presiona en la zona T y bajo los ojos.', 'Retira el exceso con una brocha limpia.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['polvo', 'traslucido', 'rostro', 'sellar']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'polvo-suelto-baby-blur';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Calma rojeces en pocos días', 'Se puede usar mañana y noche', 'Sin fragancia ni alcohol', 'Compatible con retinol y vitamina C']::text[],
  ingredients = 'Aqua, Centella Asiatica Extract (5%), Panthenol (3%), Sodium Hyaluronate, Glycerin, Madecassoside, Allantoin, Beta-Glucan, Phenoxyethanol. Apto para piel sensible.',
  how_to      = array['Sobre el rostro limpio y húmedo, aplica 3 o 4 gotas.', 'Presiona con las palmas, sin frotar.', 'Sigue con tu hidratante para sellar.', 'De día, termina siempre con protector solar.']::text[],
  faqs        = '[{"q":"¿Puedo usarlo si tengo acné?","a":"Sí, es de los pocos serums que no interfiere: calma la irritación que dejan los tratamientos."},{"q":"¿Se siente pegajoso?","a":"No. Es textura de agua y seca en unos 20 segundos."}]'::jsonb,
  tags        = array['serum', 'skincare', 'centella', 'rojeces', 'nuevo']::text[],
  is_featured = false,
  is_new      = true,
  is_favorite = true
where slug = 'serum-calmante-petal-water';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Textura densa que no se va con el sudor', 'Sirve también en cutículas y párpados secos', 'Sabor neutro, aroma leve a vainilla', 'Rinde meses']::text[],
  ingredients = 'Butyrospermum Parkii (Shea) Butter, Cera Alba, Ricinus Communis Seed Oil, Lanolina vegetal, Tocopherol, Bisabolol, Aroma natural de vainilla.',
  how_to      = array['Toma un poquito con el dedo limpio.', 'Aplica una capa generosa antes de dormir.', 'De día, úsalo solo o debajo del labial.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['balsamo', 'labios', 'skincare', 'reparador', 'bestseller']::text[],
  is_featured = true,
  is_new      = false,
  is_favorite = false
where slug = 'balsamo-labial-baby-balm';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Textura gel-crema, absorción en segundos', 'Con ceramidas y escualano', 'Buena base para el maquillaje', 'No tapa poros']::text[],
  ingredients = 'Aqua, Glycerin, Squalane, Ceramide NP, Ceramide AP, Sodium Hyaluronate, Panthenol, Cholesterol, Tocopherol, Phenoxyethanol.',
  how_to      = array['Aplica una avellana de producto sobre el serum.', 'Extiende con movimientos hacia arriba.', 'Usa mañana y noche.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['crema', 'hidratante', 'skincare', 'ceramidas']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'crema-nube-cloud-cream';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Mango de madera clara con detalle dorado', 'No absorbe producto de más', 'Incluye estuche de viaje', 'Fibra vegana, cruelty free']::text[],
  ingredients = 'Fibra sintética Taklon, mango de madera FSC, virola de aluminio. Libre de pelo animal.',
  how_to      = array['Lava con jabón neutro una vez por semana.', 'Sécalas boca abajo o acostadas, nunca de punta hacia arriba.', 'Guárdalas en el estuche cuando viajes.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['brochas', 'set', 'accesorios', 'brushes']::text[],
  is_featured = true,
  is_new      = false,
  is_favorite = false
where slug = 'set-brochas-cloud-brush';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Cierre firme que no se abre en el bolso', 'Aumento 2x para delinear', 'Carcasa mate que no se raya', 'Viene en bolsita de tela']::text[],
  ingredients = 'Carcasa de ABS reciclado, espejo de vidrio templado, bolsita de algodón.',
  how_to      = array['Usa la cara plana para revisar el maquillaje.', 'Usa el aumento 2x para cejas y delineado.', 'Limpia con un paño de microfibra seco.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['espejo', 'accesorios', 'bolsillo', 'compacto']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'espejo-bolsillo-mirror-mirror';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Interior impermeable, fácil de limpiar', 'Cierre metálico con dije de corazón', 'Se para sola cuando está llena', 'Dos bolsillos internos']::text[],
  ingredients = 'Exterior de nylon acolchado, interior de TPU impermeable, cierre de aleación de zinc.',
  how_to      = array['Limpia el interior con un paño húmedo.', 'No la metas a la lavadora: pierde el acolchado.', 'Guarda los líquidos en el bolsillo con cierre.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['cosmetiquera', 'organizacion', 'accesorios', 'pouch', 'favorito']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = true
where slug = 'cosmetiquera-puffy-pouch';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Papel de 100 g, apto para marcadores', 'Abre plano, sin pelear con el lomo', 'Cinta separadora y bolsillo trasero', 'Tapa dura con relieve de flor']::text[],
  ingredients = 'Papel FSC de 100 g, tapa dura forrada, hilo cosido, cinta de raso.',
  how_to      = array['Úsalo como bullet journal, agenda o diario.', 'Prueba tus marcadores en la última página.', 'El bolsillo trasero es perfecto para stickers.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['cuaderno', 'papeleria', 'journal', 'nuevo']::text[],
  is_featured = false,
  is_new      = true,
  is_favorite = false
where slug = 'cuaderno-notas-cute';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Ahorras $40.000 frente a comprarlos por separado', 'Tarjeta escrita a mano con tu mensaje', 'Caja rígida reutilizable', 'Puedes enviarlo directo a la persona']::text[],
  ingredients = 'Contiene: Labial Satinado Cloud Kiss, Bálsamo Baby Balm, Espejo Mirror Mirror y Bruma Dewy Mist. Ver ingredientes de cada producto en su página.',
  how_to      = array['Elige el tono del labial en las notas del pedido.', 'Escríbenos el mensaje para la tarjeta al finalizar la compra.', 'Si es sorpresa, cuéntanos y no ponemos factura dentro.']::text[],
  faqs        = '[{"q":"¿Puedo cambiar un producto del kit?","a":"Sí, escríbenos por WhatsApp antes de pagar y lo armamos a tu gusto."},{"q":"¿Lo envían directo a quien lo recibe?","a":"Claro. Pon la dirección de esa persona en el checkout y su nombre en las notas."}]'::jsonb,
  tags        = array['kit', 'regalo', 'caja', 'bestseller', 'set']::text[],
  is_featured = true,
  is_new      = false,
  is_favorite = true
where slug = 'kit-regalo-cute-box';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Notas: vainilla de Madagascar, almendra, almizcle blanco', '6 a 8 horas de duración', 'Frasco de vidrio con tapa dorada suave', 'Unisex']::text[],
  ingredients = 'Alcohol Denat., Parfum, Aqua, Benzyl Benzoate, Coumarin, Vanillin, Linalool. Concentración eau de parfum (15%).',
  how_to      = array['Rocía a 15 cm en muñecas y cuello.', 'No frotes: rompe las notas de salida.', 'Aplica sobre piel hidratada para que dure más.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['perfume', 'vainilla', 'fragancia', 'nuevo']::text[],
  is_featured = false,
  is_new      = true,
  is_favorite = false
where slug = 'perfume-vanilla-cloud';

update public.products set
  shades      = '[]'::jsonb,
  highlights  = array['Segura para el cabello: sin alcohol fuerte', 'Hidrata con glicerina y aloe', 'Tamaño de cartera', 'Se puede capear con el perfume']::text[],
  ingredients = 'Aqua, Glycerin, Parfum, Aloe Barbadensis Leaf Juice, Panthenol, Polysorbate 20, Phenoxyethanol.',
  how_to      = array['Agita y rocía sobre el cuerpo después de la ducha.', 'También en el cabello, a 30 cm de distancia.', 'Reaplica cuando quieras.']::text[],
  faqs        = '[]'::jsonb,
  tags        = array['bruma', 'corporal', 'perfume', 'vainilla']::text[],
  is_featured = false,
  is_new      = false,
  is_favorite = false
where slug = 'bruma-corporal-sugar-cloud';
