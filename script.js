const downloadButton = document.getElementById("downloadButton");
const statusDiv = document.getElementById("status");



// Função para baixar fotos e vídeos
async function baixarFotosEVideos() {
  const itemId = document.getElementById("itemId").value.trim();

  if (!itemId) {
    statusDiv.textContent = "Por favor, insira o ID do anúncio.";
    return;
  }

  statusDiv.textContent = "Buscando fotos e vídeos...";

  try {
    // Requisição para obter detalhes do anúncio
    const response = await axios.get(`https://api.mercadolibre.com/items/${itemId}`, {
    });

    const { pictures, video_id } = response.data;

    // Verificar se há imagens
    if ((!pictures || pictures.length === 0) && !video_id) {
      statusDiv.textContent = "Nenhuma foto ou vídeo encontrada para este anúncio.";
      return;
    }

    // Criar o ZIP
    const zip = new JSZip();
    const urlSet = new Set(); // Para evitar URLs duplicadas

    // Fazer o download de cada foto
    if (pictures && pictures.length > 0) {
      for (let i = 0; i < pictures.length; i++) {
        const picture = pictures[i];

        // Evitar duplicatas
        if (urlSet.has(picture.url)) continue;
        urlSet.add(picture.url);

        const photoResponse = await axios.get(picture.url, { responseType: "blob" });
        zip.file(`foto_${i + 1}.jpg`, photoResponse.data);
        statusDiv.textContent = `Baixando foto ${i + 1} de ${pictures.length}...`;
      }
    }

    // Fazer o download do vídeo, se existir
    if (video_id) {
      const videoUrl = `https://api.mercadolibre.com/videos/${video_id}`;
      const videoResponse = await axios.get(videoUrl, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      // Evitar duplicatas de vídeos
      if (!urlSet.has(videoUrl)) {
        zip.file(`video_${video_id}.mp4`, videoResponse.data);
        statusDiv.textContent = "Baixando vídeo...";
        urlSet.add(videoUrl);
      }
    }

    // Gerar o arquivo ZIP
    statusDiv.textContent = "Compactando arquivos...";
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Criar o link para download
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = `anuncio_${itemId}.zip`;
    a.click();

    statusDiv.textContent = "Download concluído!";
  } catch (error) {
    console.error(error);
    statusDiv.textContent = "Erro ao baixar fotos ou vídeos. Verifique o ID do anúncio ou o token de acesso.";
  }
}

// Adicionar evento ao botão
downloadButton.addEventListener("click", baixarFotosEVideos);
