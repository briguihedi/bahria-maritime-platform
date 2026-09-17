const images = [
  {
    src: '/photo1.png',
    label: 'Port de Sousse',
  },
  {
    src: '/photo2.jpg',
    label: 'Magasin Sous Douane',
  },
  {
    src: '/photo3.jpg',
    label: 'Transport Maritime',
  },
  {
    src: '/photo4.jpg',
    label: 'Logistique & Transit',
  },
  {
    src: '/photo5.png',
    label: 'Port de Bizerte',
  },
];

export default function Gallery() {
  return (
    <div id="gallery">
      <div className="gallery-strip">
        {images.map((img, i) => (
          <div className="gallery-img" key={i}>
            <img src={img.src} alt={img.label} loading="lazy" />
            <div className="gallery-img-label">{img.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}