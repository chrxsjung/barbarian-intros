// =====================
// carousel & profile logic explanation
// =====================
/*
this app displays multiple intern profiles, each with its own image carousel. the carousel and profile navigation logic is designed to ensure:
- each profile remembers which image was last shown in its carousel.
- switching between profiles always shows the correct image for that profile.
- carousel navigation (left/right arrows) only affects the currently active profile.

*/
// global state management - keeps track of which profile is currently displayed
let currentProfileIndex = 0; // start at the first profile (index 0)
const profiles = document.querySelectorAll(".profile-card"); // get all profile cards from the page using css selector
const totalProfiles = profiles.length; // count how many profiles there are for navigation limits

// carousel state management - tracks current image for active profile
let currentCarouselIndex = 0; // tracks which image is currently shown in the active profile's carousel

// when a carousel arrow is clicked, the profileCarousel function is triggered.
// this function finds all images for the active profile's carousel and updates which image is visible.
// it hides the current image and shows the next or previous image based on the direction.
// the currentCarouselIndex is updated to track which image is currently shown.
// finally, only the correct image for the active profile is visible.

// =====================
// handles left/right arrow clicks for the active profile's image carousel.
// trigger: called by clicking carousel arrow buttons in the ui.
// steps:
//   1. gets the currently active profile and its images.
//   2. removes 'active' from the current image.
//   3. updates the carousel index (with bounds checking).
//   4. adds 'active' to the new image to show it.
// outcome: only the correct image for the active profile is visible.
// =====================
function profileCarousel(direction) {
  // get all images in the currently active profile's carousel
  const images = document.querySelectorAll(
    ".profile-card.active .carousel-image"
  );
  if (images.length === 0) return; // safety check
  // remove active class from current image to hide it
  images[currentCarouselIndex].classList.remove("active");
  // update index with bounds checking
  currentCarouselIndex = Math.max(
    0, // minimum index (first image)
    Math.min(currentCarouselIndex + direction, images.length - 1) // maximum index (last image)
  );
  // add active class to new image to show it
  images[currentCarouselIndex].classList.add("active");
}

// =====================
// updates which profile is currently visible on screen.
// trigger: called when switching profiles (next/previous), or on app init.
// steps:
//   1. hides all profile cards and their images.
//   2. shows the current profile and the first image in its carousel.
// outcome: only one profile and its first image are visible at a time.
// =====================
function updateProfile() {
  // hide all profile cards and all their images
  profiles.forEach((profile) => {
    profile.classList.remove("active", "fade-out");
    // hide all images in this profile
    const images = profile.querySelectorAll(".carousel-image");
    images.forEach((img) => img.classList.remove("active"));
  });
  // show the current profile by adding the 'active' class (if profile exists)
  if (profiles[currentProfileIndex]) {
    profiles[currentProfileIndex].classList.add("active");
    // show the first image for this profile
    const images =
      profiles[currentProfileIndex].querySelectorAll(".carousel-image");
    if (images.length > 0) {
      images[0].classList.add("active");
      currentCarouselIndex = 0; // reset to first image
    }
  }
}

// =====================
// navigates to the next profile in the sequence.
// trigger: called by right nav button, right arrow key, or after closing modal.
// steps:
//   1. increments currentprofileindex if not at last profile.
//   2. calls updateprofile() and scrolls to top.
// outcome: ui updates to show the next profile.
// =====================
function nextProfile() {
  // check if we're not at the last profile before moving forward
  if (currentProfileIndex < totalProfiles - 1) {
    currentProfileIndex++; // increment to next profile
    updateProfile(); // update the display to show new profile
    scrollAppContainerToTop(); // reset scroll position to top for new profile
  }
  // if at the last profile, do nothing (no end screen or loop)
}

// =====================
// navigates to the previous profile in the sequence.
// trigger: called by left nav button or left arrow key.
// steps:
//   1. decrements currentprofileindex if not at first profile.
//   2. calls updateprofile() and scrolls to top.
// outcome: ui updates to show the previous profile.
// =====================
function previousProfile() {
  // check if we're not at the first profile before moving backward
  if (currentProfileIndex > 0) {
    currentProfileIndex--; // decrement to previous profile
    updateProfile(); // update the display to show new profile
    scrollAppContainerToTop(); // reset scroll position to top for new profile
  }
}

// =====================
// handles like or pass actions on the current profile.
// trigger: called by like/pass buttons or enter key.
// steps:
//   1. adds fade-out animation to current profile.
//   2. after animation, hides profile and (if liked) shows modal.
//   3. if liked, shows modal and moves to next profile after closing.
//   4. if passed, moves to next profile directly.
// outcome: smooth transition/animation, modal for likes, profile navigation.
// =====================
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
      showRejectModal(() => {
        nextProfile();
        scrollAppContainerToTop();
      });
    }
  }, 350); // wait 350ms for fade-out animation to complete
}

/*
Because both the profile names array and the QR code file paths array are in the same order, and both use currentProfileIndex to select their value, the following is guaranteed:

If the profile name displayed is "Sara" (from profileNames[currentProfileIndex]),
then the QR code shown will be "sara.png" (from qrCodes[currentProfileIndex]).

*/

// =====================
// returns the current profile's name for modal display.
// trigger: called by showcoffeemodal() to personalize modal text.
// steps:
//   1. uses currentprofileindex to get the name from a static array.
// outcome: returns the correct name for the current profile.
// =====================
function getCurrentProfileName() {
  // array of profile names in the same order as the profiles
  const profileNames = [
    // Array of profile names in the same order as the profiles
    "Mahima",
    "Jose",
    "Chris",
    "Arielle",
    "Claire",
    "Henry",
    "HungChi",
    "Sara",
    "Joshua",
    "Gio",
    "Saul",
  ];
  // return the name for the current profile index, or fallback text
  return profileNames[currentProfileIndex] || "the intern";
}

// =====================
// returns the current profile's qr code file path.
// trigger: called by showcoffeemodal() to display the correct qr code.
// steps:
//   1. uses currentprofileindex to get the qr code path from a static array.
// outcome: returns the correct qr code path for the current profile.
// =====================
function getCurrentProfileQrCode() {
  // array of qr code files for each profile (currently all use same file)
  const qrCodes = [
    "qrCodes/mahima.png",
    "qrCodes/jose.jpg",
    "qrCodes/chrisQR.png",
    "qrCodes/arielle.png",
    "qrCodes/claire.png",
    "qrCodes/henry.png",
    "qrCodes/hungchi.png",
    "qrCodes/sara.png",
    "qrCodes/joshua.png",
    "qrCodes/gio.png",
    "qrCodes/saul.png",
  ];

  // return the qr code path for the current profile index
  return qrCodes[currentProfileIndex];
}

// when the like button is clicked (or enter is pressed), the showcoffeemodal function is triggered.
// this function finds all necessary modal elements (like match title, description, and qr code area).
// it checks if these elements exist, and if so, replaces their placeholder content with personalized info for the current profile.
// specifically, it updates the match title and description, and displays the correct qr code image.
// finally, it makes the modal visible with the updated information for the user.

// =====================
// shows the coffee chat modal with qr code.
// trigger: called by reacttoprofile('like') after fade-out animation.
// steps:
//   1. gets modal and its elements.
//   2. sets match title/description and qr code for current profile.
//   3. shows modal (display: flex), hides app container.
//   4. sets up close button to hide modal, reset qr, show app, and call callback.
// outcome: modal pops up with personalized info; closes cleanly and triggers callback (e.g., next profile).
// =====================
function showCoffeeModal(onClose) {
  // get references to modal elements
  const modal = document.getElementById("coffeeModal"); // get the modal overlay element
  const closeBtn = document.getElementById("closeCoffeeModalBtn"); // get the ok button element (unique id)
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
    matchDesc.textContent = `Connect with ${currentName} by scanning the QR code below.`; // set personalized description
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

  // set up the close button click handler (for coffee modal)
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

function showRejectModal(onClose) {
  // get references to modal elements
  const modal = document.getElementById("rejectModal"); // get the modal overlay element
  const closeBtn = document.getElementById("closeRejectModalBtn"); // get the ok button element (unique id)
  const qrCode = document.querySelector(".qr-code-placeholder2"); // get the qr code container
  const matchTitle = modal.querySelector(".match-title"); // get the match title element
  const matchDesc = modal.querySelector(".match-desc"); // get the match description element
  const appContainer = document.querySelector(".app-container"); // get the main app container

  // safety check - if modal or button not found, exit function
  if (!modal || !closeBtn) return;

  // set the match title and description with the current profile name
  const currentName = getCurrentProfileName(); // get current profile's name
  if (matchTitle) {
    matchTitle.textContent = "you don't get that option lol"; // set the match title
  }
  if (matchDesc) {
    matchDesc.textContent = `Connect with ${currentName} by scanning the QR code below.`; // set personalized description
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

  // set up the close button click handler (for reject modal)
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

// =====================
// scrolls the app container back to the top.
// trigger: called after profile navigation or modal close.
// steps:
//   1. gets app container and sets scrolltop to 0.
// outcome: profile view is reset to top for new profile.
// =====================
function scrollAppContainerToTop() {
  const appContainer = document.querySelector(".app-container"); // get the app container
  if (appContainer) {
    appContainer.scrollTop = 0; // scroll to the top of the container
  }
}

// =====================
// handles keyboard navigation for profiles and scrolling.
// trigger: listens for keydown events globally.
// steps:
//   1. ignores keys if modal is open.
//   2. left/right arrows: previous/next profile.
//   3. enter: like current profile.
//   4. up/down arrows: scroll app container.
// outcome: enables smooth keyboard navigation and accessibility.
// =====================
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
  } else if (event.key === "ArrowUp") {
    // Scroll the app container up by 60px (like a scroll wheel up)
    const appContainer = document.querySelector(".app-container"); // get the main white container
    if (appContainer) {
      appContainer.scrollTop -= 60; // move scroll position up by 60 pixels
    }
  } else if (event.key === "ArrowDown") {
    // Scroll the app container down by 60px (like a scroll wheel down)
    const appContainer = document.querySelector(".app-container"); // get the main white container
    if (appContainer) {
      appContainer.scrollTop += 60; // move scroll position down by 60 pixels
    }
  }
});

// =====================
// initializes the app by showing the first profile.
// trigger: runs once on script load.
// steps:
//   1. calls updateprofile() to display the first profile.
// outcome: app starts with the first profile visible.
// =====================
updateProfile();

// =====================
// adds fade-out animation styles dynamically to the page.
// trigger: runs once on script load.
// steps:
//   1. creates a <style> element with fade-out css.
//   2. appends it to the document head.
// outcome: enables fade-out animation for profile transitions.
// =====================
const style = document.createElement("style"); // create a new style element
style.innerHTML = `
  .fade-out {
    opacity: 0; /* make element transparent */
    transform: scale(0.96) translateY(20px); /* slightly shrink and move down */
    transition: opacity 0.35s, transform 0.35s; /* smooth transition over 0.35 seconds */
  }
`;
document.head.appendChild(style); // add the style element to the page head
