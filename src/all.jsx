// Código actualizado con control de carga de imágenes
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

  const [imagenes, setImagenes] = useState([]);
  const [descripciones, setDescripciones] = useState([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, fecha: `${day}/${month}/${year}` }));
  }, []);

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

    Promise.all(readers).then((imgs) => {
      setImagenes((prev) => [...prev, ...imgs]);
      setDescripciones((prev) => [...prev, ...imgs.map(() => "")]);
    });
  };

  const handleDescripcionChange = (index, value) => {
    const nuevas = [...descripciones];
    nuevas[index] = value;
    setDescripciones(nuevas);
  };

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  const generarPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 20;

    const lineHeight = 5;

    const drawBlankLines = (count) => { y += lineHeight * count; };
    const drawText = (text, fontSize = 12, bold = false) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(fontSize);
      pdf.text(text, 20, y);
      y += lineHeight;
    };

    const drawSectionTitle = (title, size = 14) => {
      drawText(capitalize(title), size, true);
    };

    const drawLabeledLine = (label, value) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`${label}:`, 20, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(value, 60, y);
      y += lineHeight;
    };

    const drawTableRow = (label, value, startX = 20, endX = pageWidth - 20, rowHeight = 8) => {
      const midX = startX + (endX - startX) * 0.3;
      pdf.setDrawColor(180);
      pdf.setFillColor(230);
      pdf.rect(startX, y, midX - startX, rowHeight, "FD");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(`${label}:`, startX + 2, y + 5);
      pdf.setFillColor(255);
      pdf.rect(midX, y, endX - midX, rowHeight, "FD");
      pdf.text(value, midX + 2, y + 5);
      y += rowHeight;
    };

    pdf.addImage(logoImg, "PNG", 20, y, 37.4, 27.9);
    y += 30;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(formData.sitio, 20, y); y += 4;
    pdf.text(formData.direccion, 20, y); y += 4;
    pdf.text("Tel: " + formData.telefono, 20, y); y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    drawBlankLines(2);
    pdf.text((formData.titulo), pageWidth / 2, y, { align: "center" });
    y += 10;
    drawBlankLines(1);

    drawLabeledLine("Fecha", formData.fecha);
    drawLabeledLine("Cliente", formData.cliente);

    drawBlankLines(3);
    drawSectionTitle("Datos del equipo");
    drawTableRow("Marca", formData.marca);
    drawTableRow("Modelo", formData.modelo);
    drawTableRow("Tipo", formData.tipo);
    drawTableRow("Memoria", formData.memoria);
    drawTableRow("Almacenamiento", formData.almacenamiento);

    drawBlankLines(3);
    drawSectionTitle("Servicio");
    drawTableRow("Tipo de servicio", formData.servicio);
    drawTableRow("Valor", formData.valor);

    drawBlankLines(3);
    drawSectionTitle("Observaciones"); drawBlankLines(1);
    const obsLines = pdf.splitTextToSize(formData.observaciones);
    obsLines.forEach(line => drawText(line));
    drawBlankLines(1);

    const drawImageWithDescription = async () => {
      for (let index = 0; index < imagenes.length; index++) {
        const img = new Image();
        img.src = imagenes[index];

        await new Promise((resolve) => {
          img.onload = () => {
            if (index % 4 === 0) {
              pdf.addPage();
            }

            const cellWidth = 85;
            const cellHeight = 90;
            const margin = 10;
            const imagePadding = 4;
            const imageMaxWidth = cellWidth - imagePadding * 2;
            const imageMaxHeight = 60;

            const col = index % 2;
            const row = Math.floor((index % 4) / 2);
            const x = 20 + col * (cellWidth + margin);
            const yPos = 40 + row * (cellHeight + margin);

            pdf.setDrawColor(180);
            pdf.rect(x, yPos, cellWidth, cellHeight);

            const imgRatio = img.width / img.height;
            let displayWidth = imageMaxWidth;
            let displayHeight = displayWidth / imgRatio;

            if (displayHeight > imageMaxHeight) {
              displayHeight = imageMaxHeight;
              displayWidth = displayHeight * imgRatio;
            }

            const imgX = x + (cellWidth - displayWidth) / 2;
            const imgY = yPos + imagePadding;

            pdf.addImage(img, "JPEG", imgX, imgY, displayWidth, displayHeight);

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const text = descripciones[index] || `Foto ${index + 1}`;
            pdf.text(text, x + cellWidth / 2, yPos + cellHeight - 5, { align: "center" });

            resolve();
          };
        });
      }

      pdf.save(`informe_${formData.cliente}.pdf`);
    };

    if (imagenes.length > 0) {
      await drawImageWithDescription();
    } else {
      pdf.save(`informe_${formData.cliente}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6 sm:mb-8">
          Formulario de Informe Técnico
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 capitalize mb-1">
                fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 capitalize mb-1">
                cliente
              </label>
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
            {["marca", "modelo", "tipo", "memoria", "almacenamiento"].map(
              (name) => (
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
              )
            )}
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
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              rows={5}
              value={formData.observaciones}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Subir fotos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagenesChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md py-2 px-3"
            />
            {imagenes.map((_, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Descripción de foto ${i + 1}`}
                value={descripciones[i] || ""}
                onChange={(e) => handleDescripcionChange(i, e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}
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
