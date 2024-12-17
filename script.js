const downloadButton = document.getElementById("downloadButton");
const statusDiv = document.getElementById("status");

// Token de acesso do Mercado Livre

// Função para baixar as fotos e organizá-las em pastas
async function baixarFotos() {
  const itemId = document.getElementById("itemId").value.trim();

  if (!itemId) {
    statusDiv.textContent = "Por favor, insira o ID do anúncio.";
    return;
  }

  statusDiv.textContent = "Buscando fotos e variações...";

  try {
    // Requisição para obter detalhes do anúncio
    const response = await axios.get(`https://api.mercadolibre.com/items/${itemId}`, {
    });

    const pictures = response.data.pictures;
    const variations = response.data.variations;

    // Verificar se existem fotos
    if (!pictures || pictures.length === 0) {
      statusDiv.textContent = "Nenhuma foto encontrada para este anúncio.";
      return;
    }

    // Criar o ZIP
    const zip = new JSZip();

    // Caso existam variações, organizar fotos em pastas
    if (variations && variations.length > 0) {
      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        const variationId = variation.id;
        const variationName = `variacao_${variation.attribute_combinations.map(Attr => {return Attr.value_name}).join(" - ")}`;
        const folder = zip.folder(variationName);

        if (variation.picture_ids && variation.picture_ids.length > 0) {
          for (let j = 0; j < variation.picture_ids.length; j++) {
            const pictureId = variation.picture_ids[j];
            const picture = pictures.find((p) => p.id === pictureId);

            if (picture) {
              const photoResponse = await axios.get(picture.url.replace("http", "https"), { responseType: "blob" });
              folder.file(`foto_${j + 1}.jpg`, photoResponse.data);
              statusDiv.textContent = `Baixando foto ${j + 1} da variação ${variationId}...`;
            }
          }
        }
      }
    }

    // Adicionar fotos "principais" fora das variações
    const mainFolder = zip.folder("fotos_principais");
    for (let i = 0; i < pictures.length; i++) {
      const picture = pictures[i];
      const photoResponse = await axios.get(picture.url, { responseType: "blob" });
      mainFolder.file(`foto_${i + 1}.jpg`, photoResponse.data);
      statusDiv.textContent = `Baixando foto principal ${i + 1}...`;
    }

    // Gerar o arquivo ZIP
    statusDiv.textContent = "Compactando fotos...";
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Criar o link para download
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = `fotos_${itemId}.zip`;
    a.click();

    statusDiv.textContent = "Download concluído!";
  } catch (error) {
    console.error(error);
    statusDiv.textContent = "Erro ao baixar fotos. Verifique o ID do anúncio ou o token de acesso.";
  }
}

// Adicionar evento ao botão
downloadButton.addEventListener("click", baixarFotos);
