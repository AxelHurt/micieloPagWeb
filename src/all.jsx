import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import logoImg from "./assets/logo.png";

export default function all() {
  const [formData, setFormData] = useState({
    sitio: "Random Servicio Técnico",
    direccion: "Leandro Alem N°1487",
    telefono: "+543482220618",
    email: "",
    titulo: "Informe Técnico",
    fecha: "",
    cliente: "",
    marca: "",
    modelo: "",
    tipo: "",
    memoria: "",
    almacenamiento: "",
    servicio: "",
    valor: "",
    observaciones: ""
  });

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, fecha: `${year}-${month}-${day}` }));
  }, []);

  const [imagenes, setImagenes] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((imgs) => setImagenes((prev) => [...prev, ...imgs]));
  };

  const generarPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 10;

    const drawHeader = () => {
      const img = new Image();
      img.src = logoImg;
      img.onload = () => {
        pdf.addImage(img, "PNG", 10, y, 25, 15);
        pdf.setFontSize(12);
        pdf.setFont(undefined, "normal");
        pdf.text(formData.sitio, 40, y + 5);
        pdf.text(formData.direccion, 40, y + 11);
        pdf.text("Tel: " + formData.telefono, 40, y + 17);

        y += 30;
        pdf.setFontSize(16);
        pdf.setFont(undefined, "bold");
        pdf.text(formData.titulo, pageWidth / 2, y, { align: "center" });
        y += 10;

        drawSection();
      };
    };

    const drawSection = () => {
      const addLabel = (label, value) => {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text(`${label}:`, 10, y);
        pdf.setFont(undefined, "normal");
        pdf.text(value, 40, y);
        y += 7;
      };

      const drawBox = (title, items) => {
        y += 5;
        pdf.setFont(undefined, "bold");
        pdf.setDrawColor(0);
        pdf.setFillColor(240);
        pdf.rect(10, y, pageWidth - 20, 8, "F");
        pdf.text(title, 12, y + 6);
        y += 12;

        pdf.setFont(undefined, "normal");
        items.forEach((item) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 10;
          }
          pdf.text(item, 12, y);
          y += 6;
        });
      };

      addLabel("Fecha", formData.fecha);
      addLabel("Cliente", formData.cliente);

      drawBox("Datos del equipo", [
        "- Marca: " + formData.marca,
        "- Modelo: " + formData.modelo,
        "- Tipo: " + formData.tipo,
        "- Memoria: " + formData.memoria,
        "- Almacenamiento: " + formData.almacenamiento
      ]);

      drawBox("Servicio", [
        "- Tipo de servicio: " + formData.servicio,
        "- Valor: " + formData.valor
      ]);

      if (formData.observaciones.trim()) {
        const obsLines = pdf.splitTextToSize(formData.observaciones, pageWidth - 24);
        if (y + obsLines.length * 6 > pageHeight - 30) {
          pdf.addPage();
          y = 10;
        }
        pdf.setFont(undefined, "bold");
        pdf.setDrawColor(0);
        pdf.setFillColor(240);
        pdf.rect(10, y, pageWidth - 20, 8, "F");
        pdf.text("Observaciones", 12, y + 6);
        y += 12;
        pdf.setFont(undefined, "normal");
        pdf.text("- " + obsLines.join("\n"), 12, y);
        y += obsLines.length * 6;
      }

      if (imagenes.length > 0) {
        if (y + 70 > pageHeight) {
          pdf.addPage();
          y = 10;
        }
        pdf.setFont(undefined, "bold");
        pdf.setDrawColor(0);
        pdf.setFillColor(240);
        pdf.rect(10, y, pageWidth - 20, 8, "F");
        pdf.text("Fotos del Servicio", 12, y + 6);
        y += 12;

        let x = 10;
        const imgWidth = (pageWidth - 30) / 2;
        const imgHeight = 60;

        imagenes.forEach((src) => {
          const img = new Image();
          img.src = src;

          if (y + imgHeight > pageHeight - 10) {
            pdf.addPage();
            y = 10;
            x = 10;
          }

          pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight);

          if (x + imgWidth + 10 > pageWidth) {
            x = 10;
            y += imgHeight + 10;
          } else {
            x += imgWidth + 10;
          }
        });
      }

      pdf.save(`informe_${formData.cliente}.pdf`);
    };

    drawHeader();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6 sm:mb-8">Formulario de Reparación</h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 capitalize mb-1">fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 capitalize mb-1">cliente</label>
              <input
                type="text"
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {["marca", "modelo", "tipo", "memoria", "almacenamiento"].map((name) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-600 capitalize mb-1">
                  {name}
                </label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {["servicio", "valor"].map((name) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-600 capitalize mb-1">
                  {name}
                </label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              rows={5}
              value={formData.observaciones}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Subir fotos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagenesChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md py-2 px-3"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={generarPDF}
            className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-200"
          >
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}