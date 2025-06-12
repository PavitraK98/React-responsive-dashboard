//for gallery-content : open modal to view img and download img -- start//

document.body.addEventListener("click", function (e) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const captionText = document.getElementById("caption");
  const closeBtn = document.querySelector(".closeBtn");
  const downloadBtn = document.getElementById("downloadImage");
  const imgElement = e.target.closest(".content-img");

  if (imgElement) {
    e.preventDefault();
    const imageUrl = imgElement.getAttribute("data-src");

    modal.style.display = "block";
    modalImg.src = "";
    modalImg.alt = "Loading...";
    captionText.innerHTML = imgElement.alt || "";

    const img = new Image();
    img.onload = function () {
      modalImg.src = imageUrl;
      modalImg.alt = imgElement.alt;
      // ✅ Set the href for the download link when image loads
      downloadBtn.setAttribute("href", imageUrl);
      downloadBtn.setAttribute("download", imageUrl.split("/").pop()); // Optional: Use filename
    };
    img.onerror = function () {
      modalImg.src = "/images/error.jpg";
      modalImg.alt = "Image not available";
    };
    img.src = imageUrl;
  }

  closeBtn.addEventListener("click", function () {
    closeBtn.style.cursor = "pointer";
    modal.style.display = "none";
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

//for gallery-content : open modal to view img and download img -- end//

//for gallery-content : open modal to view video and download video -- start//
$(document).ready(function () {
  $("#openVideoModel").on("click", function (e) {
    e.preventDefault();
    var videoSrc = $(this).find(".content-video").attr("src");
    var videoAlt = $(this).find(".content-video").attr("alt");

    $("#modalVideo source").attr("src", videoSrc);
    var video = $("#modalVideo")[0];
    video.load();

    video.oncanplaythrough = function () {
      video.play();
    };

    $("#videoCaption").text(videoAlt);
    $("#downloadVideo").attr({
      href: videoSrc,
      download: "",
    });
    $("#videoModal").fadeIn();
  });

  // Close video modal
  $(".closeVideoBtn").on("click", function () {
    var video = $("#modalVideo")[0];
    video.pause();
    video.currentTime = 0;
    $("#videoModal").fadeOut();
  });

  // Close modal when clicking outside the content
  $(".gallery-video-Model").on("click", function (e) {
    if ($(e.target).is(".gallery-video-Model")) {
      var video = $("#modalVideo")[0];
      video.pause();
      video.currentTime = 0;
      $("#videoModal").fadeOut();
    }
  });

  // Prevent modal close when clicking inside the dialog
  $(".gallery-video-modal-dialog").on("click", function (e) {
    e.stopPropagation();
  });
});
//for gallery-content : open modal to view video and download video -- end//
