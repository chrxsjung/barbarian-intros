// =====================
// CAROUSEL & PROFILE LOGIC EXPLANATION
// =====================
/*
This app displays multiple intern profiles, each with its own image carousel. The carousel and profile navigation logic is designed to ensure:
- Each profile remembers which image was last shown in its carousel.
- Switching between profiles always shows the correct image for that profile.
- Carousel navigation (left/right arrows) only affects the currently active profile.

Key Concepts:
1. carouselIndices: An array where each element stores the current image index for a profile's carousel. For example, carouselIndices[0] is the index for profile 1, carouselIndices[1] for profile 2, etc.
2. profileCarousel(direction): A generic function that moves the carousel left or right for the currently active profile. It updates the correct index in carouselIndices and toggles the 'active' class on images to show/hide them.
3. updateProfile(): When switching profiles, this function hides all profiles and their images, then shows the selected profile and the correct image in its carousel (using carouselIndices).

This approach ensures each profile's carousel is independent, and navigation is smooth and bug-free.
*/
// global state management - keeps track of which profile is currently displayed
let currentProfileIndex = 0; // start at the first profile (index 0)
const profiles = document.querySelectorAll(".profile-card"); // get all profile cards from the page using css selector
const totalProfiles = profiles.length; // count how many profiles there are for navigation limits

// carousel state management for all profiles - array of indices
let carouselIndices = Array.from({ length: totalProfiles }, () => 0); // each profile gets its own index

// function to handle left/right arrow clicks for the active profile's image carousel
// direction: -1 for left arrow, 1 for right arrow
function profileCarousel(direction) {
  // get the index of the currently active profile
  const activeProfile = currentProfileIndex;
  // get all images in the currently active profile's carousel
  const images = document.querySelectorAll(
    ".profile-card.active .carousel-image"
  );
  if (images.length === 0) return; // safety check
  // remove active class from current image to hide it
  images[carouselIndices[activeProfile]].classList.remove("active");
  // update index for this profile with bounds checking
  carouselIndices[activeProfile] = Math.max(
    0, // minimum index (first image)
    Math.min(carouselIndices[activeProfile] + direction, images.length - 1) // maximum index (last image)
  );
  // add active class to new image to show it
  images[carouselIndices[activeProfile]].classList.add("active");
}

// function to update which profile is currently visible on screen
function updateProfile() {
  // hide all profile cards and all their images
  profiles.forEach((profile, idx) => {
    profile.classList.remove("active", "fade-out");
    // hide all images in this profile
    const images = profile.querySelectorAll(".carousel-image");
    images.forEach((img) => img.classList.remove("active"));
  });
  // show the current profile by adding the 'active' class (if profile exists)
  if (profiles[currentProfileIndex]) {
    profiles[currentProfileIndex].classList.add("active");
    // show the correct image for this profile
    const images =
      profiles[currentProfileIndex].querySelectorAll(".carousel-image");
    if (images.length > 0) {
      images[carouselIndices[currentProfileIndex]].classList.add("active");
    }
  }
}

// function to navigate to the next profile in the sequence
function nextProfile() {
  // check if we're not at the last profile before moving forward
  if (currentProfileIndex < totalProfiles - 1) {
    currentProfileIndex++; // increment to next profile
    updateProfile(); // update the display to show new profile
  }
  // if at the last profile, do nothing (no end screen or loop)
}

// function to navigate to the previous profile in the sequence
function previousProfile() {
  // check if we're not at the first profile before moving backward
  if (currentProfileIndex > 0) {
    currentProfileIndex--; // decrement to previous profile
    updateProfile(); // update the display to show new profile
  }
}

// function to handle like or pass actions on the current profile
// action: 'like' or 'pass' string indicating user's choice
function reactToProfile(action) {
  // get the current profile card element
  const currentProfile = profiles[currentProfileIndex];
  if (!currentProfile) return; // safety check - if no profile exists, do nothing

  // add a fade-out animation class for visual feedback
  currentProfile.classList.add("fade-out");

  // after the animation completes, handle the action
  setTimeout(() => {
    // remove both active and fade-out classes to hide the profile
    currentProfile.classList.remove("active", "fade-out");

    if (action === "like") {
      // if user liked the profile, show the coffee chat modal first
      showCoffeeModal(() => {
        // after modal closes, move to next profile
        nextProfile();
        // scroll the app container back to top for new profile
        scrollAppContainerToTop();
      });
    } else if (action === "pass") {
      // if user passed the profile, just move to next profile
      nextProfile();
    }
  }, 350); // wait 350ms for fade-out animation to complete
}

// function to get the current profile's name for the modal display
function getCurrentProfileName() {
  // array of profile names in the same order as the profiles
  const profileNames = [
    "Christopher Jung",
    "Marcus Rodriguez",
    "Emily Johnson",
    "Alex Thompson",
    "Priya Patel",
  ];
  // return the name for the current profile index, or fallback text
  return profileNames[currentProfileIndex] || "the intern";
}

// function to get the current profile's qr code file path
function getCurrentProfileQrCode() {
  // array of qr code files for each profile (currently all use same file)
  const qrCodes = [
    "qrCodes/chris.png",
    "qrCodes/chris.png",
    "qrCodes/chris.png",
    "qrCodes/chris.png",
    "qrCodes/chris.png",
  ];

  // return the qr code path for the current profile index
  return qrCodes[currentProfileIndex];
}

// function to show the coffee chat modal with qr code
// onClose: callback function to execute when modal is closed
function showCoffeeModal(onClose) {
  // get references to modal elements
  const modal = document.getElementById("coffeeModal"); // get the modal overlay element
  const closeBtn = document.getElementById("closeModalBtn"); // get the ok button element
  const qrCode = document.querySelector(".qr-code-placeholder"); // get the qr code container
  const matchTitle = modal.querySelector(".match-title"); // get the match title element
  const matchDesc = modal.querySelector(".match-desc"); // get the match description element
  const appContainer = document.querySelector(".app-container"); // get the main app container

  // safety check - if modal or button not found, exit function
  if (!modal || !closeBtn) return;

  // set the match title and description with the current profile name
  const currentName = getCurrentProfileName(); // get current profile's name
  if (matchTitle) {
    matchTitle.textContent = "It's a Match! 🎉"; // set the match title
  }
  if (matchDesc) {
    matchDesc.textContent = `You and ${currentName} are now connected! Time to welcome them to the team properly.`; // set personalized description
  }

  // show the modal and qr code
  modal.style.display = "flex"; // display the modal overlay
  if (qrCode) {
    // get the qr code file path for the current profile
    const currentQrCode = getCurrentProfileQrCode();
    // replace the placeholder text with the actual qr code image
    qrCode.innerHTML = `<img src="${currentQrCode}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;">`;
    qrCode.classList.add("show"); // show the qr code container
  }
  // hide the main app container while modal is open
  if (appContainer) {
    appContainer.classList.add("hide-when-modal");
  }

  // set up the close button click handler
  closeBtn.onclick = () => {
    modal.style.display = "none"; // hide the modal
    if (qrCode) {
      qrCode.classList.remove("show"); // hide the qr code
      // reset the qr code back to placeholder text
      qrCode.innerHTML = "qr";
    }
    if (appContainer) {
      appContainer.classList.remove("hide-when-modal"); // show the app container again
    }
    // execute the callback function if provided
    if (typeof onClose === "function") onClose();
  };
}

// function to scroll the app container back to the top
function scrollAppContainerToTop() {
  const appContainer = document.querySelector(".app-container"); // get the app container
  if (appContainer) {
    appContainer.scrollTop = 0; // scroll to the top of the container
  }
}

// keyboard navigation event listener - handles arrow keys and enter key
window.addEventListener("keydown", function (event) {
  // check if modal is open - if so, ignore key presses
  const modal = document.getElementById("coffeeModal");
  if (modal && modal.style.display === "flex") return;

  // left arrow key goes to previous profile
  if (event.key === "ArrowLeft") {
    previousProfile();
    // right arrow key goes to next profile
  } else if (event.key === "ArrowRight") {
    nextProfile();
    // enter key likes the current profile
  } else if (event.key === "Enter") {
    reactToProfile("like");
  }
});

// initialize the app by showing the first profile
updateProfile();

// add fade-out animation styles dynamically to the page
const style = document.createElement("style"); // create a new style element
style.innerHTML = `
  .fade-out {
    opacity: 0; /* make element transparent */
    transform: scale(0.96) translateY(20px); /* slightly shrink and move down */
    transition: opacity 0.35s, transform 0.35s; /* smooth transition over 0.35 seconds */
  }
`;
document.head.appendChild(style); // add the style element to the page head
