/* ============================================================
   TROQUE AQUI PELAS SUAS IMAGENS
   Cada par liga a imagem do SORTEIO à imagem da CARTELA.

   Coloque os arquivos na pasta  public/imagens/  e use:
     sorteio: { img: "/imagens/vaca.png" },
     cartela: { img: "/imagens/leite.png" },

   Enquanto não tiver as imagens, use "emoji" como provisório.
   ============================================================ */
export const PARES = [
  { id: 1,  sorteio: { emoji: "🐄" }, cartela: { emoji: "🥛" }, nome: "Vaca → Leite" },
  { id: 2,  sorteio: { emoji: "🐝" }, cartela: { emoji: "🍯" }, nome: "Abelha → Mel" },
  { id: 3,  sorteio: { emoji: "🐔" }, cartela: { emoji: "🥚" }, nome: "Galinha → Ovo" },
  { id: 4,  sorteio: { emoji: "🌧️" }, cartela: { emoji: "☂️" }, nome: "Chuva → Guarda-chuva" },
  { id: 5,  sorteio: { emoji: "🔥" }, cartela: { emoji: "🧯" }, nome: "Fogo → Extintor" },
  { id: 6,  sorteio: { emoji: "☀️" }, cartela: { emoji: "🕶️" }, nome: "Sol → Óculos" },
  { id: 7,  sorteio: { emoji: "🐶" }, cartela: { emoji: "🦴" }, nome: "Cachorro → Osso" },
  { id: 8,  sorteio: { emoji: "🐟" }, cartela: { emoji: "🎣" }, nome: "Peixe → Vara de pesca" },
  { id: 9,  sorteio: { emoji: "❄️" }, cartela: { emoji: "⛄" }, nome: "Neve → Boneco de neve" },
  { id: 10, sorteio: { emoji: "🐒" }, cartela: { emoji: "🍌" }, nome: "Macaco → Banana" },
  { id: 11, sorteio: { emoji: "🐰" }, cartela: { emoji: "🥕" }, nome: "Coelho → Cenoura" },
  { id: 12, sorteio: { emoji: "🌙" }, cartela: { emoji: "🛏️" }, nome: "Noite → Cama" },
  { id: 13, sorteio: { emoji: "🦷" }, cartela: { emoji: "🪥" }, nome: "Dente → Escova" },
  { id: 14, sorteio: { emoji: "⚽" }, cartela: { emoji: "🥅" }, nome: "Bola → Gol" },
  { id: 15, sorteio: { emoji: "✉️" }, cartela: { emoji: "📮" }, nome: "Carta → Caixa do correio" },
  { id: 16, sorteio: { emoji: "🎂" }, cartela: { emoji: "🕯️" }, nome: "Bolo → Vela" },
  { id: 17, sorteio: { emoji: "🔑" }, cartela: { emoji: "🚪" }, nome: "Chave → Porta" },
  { id: 18, sorteio: { emoji: "🎨" }, cartela: { emoji: "🖌️" }, nome: "Tinta → Pincel" },
  { id: 19, sorteio: { emoji: "🚗" }, cartela: { emoji: "⛽" }, nome: "Carro → Combustível" },
  { id: 20, sorteio: { emoji: "🌱" }, cartela: { emoji: "🚿" }, nome: "Planta → Água" },
  { id: 21, sorteio: { emoji: "🐑" }, cartela: { emoji: "🧶" }, nome: "Ovelha → Lã" },
  { id: 22, sorteio: { emoji: "📚" }, cartela: { emoji: "🎒" }, nome: "Livro → Mochila" },
  { id: 23, sorteio: { emoji: "🎵" }, cartela: { emoji: "🎧" }, nome: "Música → Fone" },
  { id: 24, sorteio: { emoji: "🍕" }, cartela: { emoji: "🍽️" }, nome: "Pizza → Prato" },
];

export const TAM_CARTELA = 16;        // 4x4
export const LETRAS = ["B", "I", "N", "G"];
export const QTD_RECENTES = 5;        // quantas sorteadas aparecem na faixa da cartela
