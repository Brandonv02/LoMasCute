-- ============================================================
-- Lo Más Cute — datos iniciales
-- Generado desde el catálogo que hoy vive en src/data/*.ts, para que el
-- panel arranque con contenido real en lugar de una tabla vacía.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar nada.
--
-- No siembra product_images a propósito. La subida de imágenes llega en una
-- fase posterior y no queremos filas apuntando a objetos que no existen en
-- el bucket.
-- ============================================================

-- ------------------------------------------------------------- categorías

insert into public.categories (slug, name, claim, description, image_url, tone, position, coming_soon)
values
  ('maquillaje', 'Maquillaje', 'Tu cara lavada, pero mejor', 'Labiales, rubores, sombras y bases con acabados suaves y naturales. Fórmulas livianas, tonos que combinan con todo y empaques que dan gusto sacar del bolso.', '/art/categoria-maquillaje.svg', 'rose'::public.brand_tone, 10, false),
  ('skincare', 'Skincare', 'Rutina cortita, piel feliz', 'Lo esencial para una rutina de tres pasos: limpiar, hidratar y proteger. Sin ingredientes agresivos ni promesas imposibles.', '/art/categoria-skincare.svg', 'mint'::public.brand_tone, 20, false),
  ('accesorios', 'Accesorios', 'Los detalles que te alegran', 'Brochas suavísimas, espejos de bolsillo, cosmetiqueras acolchadas y todo lo que hace que arreglarse sea un ritual bonito.', '/art/categoria-accesorios.svg', 'lavender'::public.brand_tone, 30, false),
  ('perfumes', 'Perfumes', 'Oler a nube de vainilla', 'Brumas y perfumes ligeros, dulces sin empalagar. Para llevar en la cartera y reaplicar cuando quieras sentirte nueva.', '/art/categoria-perfumes.svg', 'gold'::public.brand_tone, 40, false),
  ('papeleria', 'Papelería', 'Escribir bonito da felicidad', 'Cuadernos, stickers, agendas y lapiceros para que tus listas, tus clases y tus planes se vean tan lindos como se sienten.', '/art/categoria-papeleria.svg', 'lavender'::public.brand_tone, 50, true),
  ('regalos', 'Regalos', 'Envuelto y listo para dar', 'Kits armados, cajas sorpresa y envolturas hechas a mano. Le pones la tarjeta y nosotras el resto.', '/art/categoria-regalos.svg', 'peach'::public.brand_tone, 60, false)
on conflict (slug) do update
  set name        = excluded.name,
      claim       = excluded.claim,
      description = excluded.description,
      image_url   = excluded.image_url,
      tone        = excluded.tone,
      position    = excluded.position,
      coming_soon = excluded.coming_soon;

-- --------------------------------------------------------------- productos

insert into public.products (
  slug, name, tagline, description,
  category_id, subcategory,
  price, compare_at_price, stock,
  status, is_featured, rating, reviews_count
)
values
  ('labial-satinado-cloud-kiss', 'Labial Satinado Cloud Kiss', 'Acabado satinado · 3.8 g', 'El labial que se siente como bálsamo y se ve como labial. Se desliza en una sola pasada, deja un satinado jugoso y no marca las líneas de los labios. Pensado para usar sin espejo, en la fila del bus o antes de entrar a clase.',
   (select id from public.categories where slug = 'maquillaje'), 'Labios',
   48900, 62900, 24,
   'published', true, 4.9, 214),
  ('gloss-espejo-glass-petal', 'Gloss Espejo Glass Petal', 'Brillo espejo · 6 ml', 'Brillo de acabado espejo, sin esa sensación pegajosa que hace que el cabello se te quede pegado. Se siente como agua y se ve como vidrio. Nuestro aplicador de gota reparte la cantidad justa.',
   (select id from public.categories where slug = 'maquillaje'), 'Labios',
   39900, null, 31,
   'published', true, 4.8, 168),
  ('rubor-en-crema-blush-nube', 'Rubor en Crema Blush Nube', 'Crema a polvo · 5 g', 'Empieza en crema y termina en polvo, así que el rubor se ve parte de la piel y no encima de ella. Un toque en cada cachete y ya tienes ese color de haber caminado bajo el sol.',
   (select id from public.categories where slug = 'maquillaje'), 'Rostro',
   44900, null, 18,
   'published', false, 4.9, 132),
  ('paleta-sombras-pastel-diary', 'Paleta de Sombras Pastel Diary', '8 tonos · edición cuaderno', 'Ocho tonos pensados como una página de diario: cuatro mates neutros, tres satinados pastel y un iluminador dorado suave. Todos combinan entre sí, así que no hay manera de equivocarse.',
   (select id from public.categories where slug = 'maquillaje'), 'Ojos',
   89900, 109900, 12,
   'published', true, 4.7, 97),
  ('bruma-fijadora-dewy-mist', 'Bruma Fijadora Dewy Mist', 'Fija y refresca · 100 ml', 'Bruma finísima que fija el maquillaje y deja la piel con ese acabado húmedo bonito. En el clima de Medellín es prácticamente obligatoria: refresca a mediodía sin dañar la base.',
   (select id from public.categories where slug = 'maquillaje'), 'Fijadores',
   52900, null, 27,
   'published', false, 4.8, 143),
  ('base-luminosa-soft-focus', 'Base Luminosa Soft Focus', 'Cobertura media · 30 ml', 'Una base que difumina la textura sin borrar tu piel. Cobertura media construible con acabado satinado, del tipo que hace que te pregunten qué skincare usas.',
   (select id from public.categories where slug = 'maquillaje'), 'Rostro',
   79900, null, 21,
   'published', false, 4.6, 88),
  ('mascara-pestanas-bunny-lash', 'Máscara de Pestañas Bunny Lash', 'Volumen y curva · 9 ml', 'Cepillo curvo pequeño que alcanza hasta la última pestaña del lagrimal. Da volumen sin grumos y mantiene la curva todo el día, incluso si te da sueño y te tallas el ojo.',
   (select id from public.categories where slug = 'maquillaje'), 'Ojos',
   46900, null, 29,
   'published', true, 4.7, 156),
  ('delineador-kitten-line', 'Delineador Kitten Line', 'Punta pincel · negro suave', 'Punta de pincel flexible que hace la línea finita del lagrimal y se abre para el rabito. Negro suave, no azulado, para que combine con el maquillaje pastel.',
   (select id from public.categories where slug = 'maquillaje'), 'Ojos',
   34900, null, 33,
   'published', false, 4.5, 74),
  ('iluminador-liquido-angel-drop', 'Iluminador Líquido Angel Drop', 'Gota de luz · 15 ml', 'Luz líquida sin glitter visible. Una gota en el puente de la nariz y arriba del pómulo cambia toda la cara. También se puede mezclar con la base para un efecto de piel mojada.',
   (select id from public.categories where slug = 'maquillaje'), 'Rostro',
   42900, null, 16,
   'published', false, 4.9, 121),
  ('corrector-second-skin', 'Corrector Second Skin', 'Cremoso, no se cuartea · 7 ml', 'Corrector cremoso que cubre la ojera sin acumularse en las líneas de expresión. Con un toque de melocotón para neutralizar el morado del desvelo.',
   (select id from public.categories where slug = 'maquillaje'), 'Rostro',
   38900, null, 25,
   'published', false, 4.6, 109),
  ('labial-mate-milky-rose', 'Labial Mate Milky Rose', 'Mate cremoso · 3.5 g', 'Mate que no reseca, que es prácticamente un oxímoron. Se siente en polvo pero deja el labio flexible. Perfecto para días largos de universidad u oficina.',
   (select id from public.categories where slug = 'maquillaje'), 'Labios',
   46900, null, 22,
   'published', false, 4.7, 93),
  ('polvo-suelto-baby-blur', 'Polvo Suelto Baby Blur', 'Traslúcido · 8 g', 'Polvo finísimo que difumina el brillo sin dejar esa capa blanca en las fotos con flash. Sella el maquillaje y deja la piel con textura de durazno.',
   (select id from public.categories where slug = 'maquillaje'), 'Rostro',
   41900, null, 19,
   'published', false, 4.5, 67),
  ('serum-calmante-petal-water', 'Serum Calmante Petal Water', 'Rojeces y barrera · 30 ml', 'Para la piel que se pone roja con todo. Centella asiática y pantenol para calmar, más ácido hialurónico de bajo peso para hidratar de verdad. Textura de agua, absorción inmediata.',
   (select id from public.categories where slug = 'skincare'), 'Serums',
   74900, null, 14,
   'published', false, 4.9, 118),
  ('balsamo-labial-baby-balm', 'Bálsamo Labial Baby Balm', 'Reparación nocturna · 15 g', 'El tarrito que va en la mesa de noche. Se aplica antes de dormir y al día siguiente los labios están lisos. También funciona de día como brillo transparente.',
   (select id from public.categories where slug = 'skincare'), 'Labios',
   29900, null, 40,
   'published', true, 4.8, 201),
  ('crema-nube-cloud-cream', 'Crema Nube Cloud Cream', 'Hidratación liviana · 50 ml', 'Hidratante en gel-crema que desaparece al tocar la piel. Ideal para el clima húmedo: hidrata sin ese peso graso que hace sudar la base.',
   (select id from public.categories where slug = 'skincare'), 'Hidratación',
   68900, 79900, 17,
   'published', false, 4.7, 86),
  ('set-brochas-cloud-brush', 'Set de Brochas Cloud Brush', '5 piezas · fibra vegana', 'Cinco brochas que cubren todo: base, corrector, rubor, sombra y difuminado. Fibra sintética suavísima que no bota pelo y se lava en un minuto.',
   (select id from public.categories where slug = 'accesorios'), 'Brochas',
   94900, 124900, 11,
   'published', true, 4.8, 79),
  ('espejo-bolsillo-mirror-mirror', 'Espejo de Bolsillo Mirror Mirror', 'Doble cara · con aumento', 'Espejo compacto con una cara normal y otra con aumento 2x, en carcasa color crema con relieve de flor. Del tamaño exacto para que quepa en cualquier cartera.',
   (select id from public.categories where slug = 'accesorios'), 'Espejos',
   32900, null, 26,
   'published', false, 4.6, 64),
  ('cosmetiquera-puffy-pouch', 'Cosmetiquera Puffy Pouch', 'Acolchada · talla mediana', 'Acolchada, impermeable por dentro y con esa forma redondita que la hace ver como una nube. Cabe una rutina completa de skincare o todo tu maquillaje diario.',
   (select id from public.categories where slug = 'accesorios'), 'Organización',
   58900, null, 15,
   'published', false, 4.9, 112),
  ('cuaderno-notas-cute', 'Cuaderno Notas Cute', 'A5 · 160 páginas punteadas', 'Papel de 100 g que no traspasa la tinta, hojas punteadas para hacer lo que quieras y tapa dura en lavanda con relieve. Abre completamente plano.',
   (select id from public.categories where slug = 'papeleria'), 'Cuadernos',
   36900, null, 20,
   'published', false, 4.7, 58),
  ('kit-regalo-cute-box', 'Kit Regalo Cute Box', '4 productos · envuelto a mano', 'Nuestra caja más regalada: labial Cloud Kiss, bálsamo Baby Balm, espejo Mirror Mirror y bruma Dewy Mist, dentro de una caja rígida con papel de seda, sello de cera y tarjeta escrita a mano con tu mensaje.',
   (select id from public.categories where slug = 'regalos'), 'Kits',
   149900, 189900, 9,
   'published', true, 5, 74),
  ('perfume-vanilla-cloud', 'Perfume Vanilla Cloud', 'Eau de parfum · 50 ml', 'Vainilla, almendra y un fondo de almizcle limpio: huele a piel recién bañada, no a postre. Dura entre 6 y 8 horas y deja una estela suave, de las que hacen que te pregunten qué te echaste.',
   (select id from public.categories where slug = 'perfumes'), 'Eau de parfum',
   129900, null, 13,
   'published', false, 4.8, 96),
  ('bruma-corporal-sugar-cloud', 'Bruma Corporal Sugar Cloud', 'Bruma ligera · 150 ml', 'La versión juguetona de Vanilla Cloud, para el cuerpo y el cabello. Más fresca, más ligera, para reaplicar todo el día sin cansar.',
   (select id from public.categories where slug = 'perfumes'), 'Brumas',
   59900, null, 23,
   'published', false, 4.7, 81)
on conflict (slug) do update
  set name             = excluded.name,
      tagline          = excluded.tagline,
      description      = excluded.description,
      category_id      = excluded.category_id,
      subcategory      = excluded.subcategory,
      price            = excluded.price,
      compare_at_price = excluded.compare_at_price,
      stock            = excluded.stock,
      is_featured      = excluded.is_featured,
      rating           = excluded.rating,
      reviews_count    = excluded.reviews_count;
