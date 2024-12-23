const petList = document.getElementById('pet-list')
const cart = document.getElementById('cart')
const modal = document.getElementById('modal')

class Api {
  static currentPets = null
  static sortOrder = null

  static getPets = async () => {
    const res = await fetch(
      'https://openapi.programming-hero.com/api/peddy/pets'
    )

    const data = await res.json()
    Api.currentPets = data.pets

    return data
  }

  static getPetById = async (id) => {
    const res = await fetch(
      `https://openapi.programming-hero.com/api/peddy/pet/${id}`
    )
    return res.json()
  }

  static getCategories = async () => {
    const res = await fetch(
      `https://openapi.programming-hero.com/api/peddy/categories`
    )
    return res.json()
  }

  static getPetsByCategory = async (categoryName) => {
    const res = await fetch(
      `https://openapi.programming-hero.com/api/peddy/category/${categoryName}`
    )

    const { data } = await res.json()
    console.log(data, '----')

    Api.currentPets = data

    return data
  }

  static getPetsByPrice = async (order = '') => {
    Api.currentPets.sort((a, b) => {
      if (a.price < b.price) return order === 'asc' ? -1 : 1
      if (a.price > b.price) return order === 'asc' ? 1 : -1
      return 0
    })

    return Api.currentPets
  }
}

class Modal {
  static open = (childElem = '') => {
    modal.innerHTML = childElem
    document.body.style.overflow = 'hidden'
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }
  static close = () => {
    document.body.style.overflow = 'auto'
    modal.classList.remove('flex')
    modal.classList.add('hidden')
  }
}

class Loader {
  static show = () => {
    petList.innerHTML = ''
    petList.innerHTML = `
    <div class="w-full h-full flex items-center justify-center col-span-full row-span-full">
    <div class="loader"></div>
    </div>
    `
  }
  static hide = () => {
    petList.innerHTML = ''
  }
}

const addToCart = (imgUri) => {
  const figure = document.createElement('figure')
  figure.classList = 'border-2 rounded-md p-2'
  figure.innerHTML = `<img
        class="rounded-md"
        src="${imgUri}"
        alt="dog"
      />`

  cart.appendChild(figure)
}

class BtnClickHandlers {
  static register = () => {
    const petListButtons = petList.querySelectorAll('#pet-list button')
    petListButtons.forEach((button) => {
      button.addEventListener('click', ({ currentTarget: clickedBtn }) =>
        BtnClickHandlers[clickedBtn.name](clickedBtn)
      )
    })
  }
  static like = (targetBtn) => {
    const imgUri =
      targetBtn.parentElement.parentElement.firstElementChild.firstElementChild.getAttribute(
        'src'
      )

    addToCart(imgUri)
  }
  static adopt = (targetBtn) => {
    const cdn = `<div class="con w-max"><div class="countdown">
        <img src="./assets/images/handshake-ico.png" alt="handshake-ico" />
        <h1>Congrats</h1>
        <p>Adoption process has been started for your pet</p>
        <p id="counter" class="countdown__counter">3</p>
      </div></div>`

    Modal.open(cdn)

    const counterElem = document.getElementById('counter')

    let count = 2
    const timerId = setInterval(() => {
      if (count < 1) {
        Modal.close()
        targetBtn.classList.add('adopted')
        clearInterval(timerId)
      }
      counterElem.innerText = count--
    }, 1000)
  }
  static details = async (targetBtn) => {
    const petId = parseInt(targetBtn.getAttribute('data-id'))

    const {
      petData: {
        breed,
        date_of_birth,
        gender,
        image,
        pet_details,
        pet_name,
        price,
        vaccinated_status,
      },
    } = await Api.getPetById(petId)

    const detailsElem = `<div class="con w-max">
    </br></br></br></br></br></br></br></br></br></br>
    <div class="animal-details bg-white p-8 rounded-xl max-w-[636px]">
        <img
          class="rounded-md w-[636px] aspect-video object-cover"
          src="${image || 'Not Available'}"
          alt="${pet_name || 'Not Available'}"
        />
        <h1 class="mt-6 text-2xl font-bold">${pet_name || 'Not Available'}</h1>
        <ul class="pet-details-tags mt-4">
          <li>
            <img
              src="./assets/images/breed-ico.png"
              alt="vaccination-ico"
            />Breed: ${breed || 'Not Available'}
          </li>
          <li>
            <img
              src="./assets/images/calender-ico.png"
              alt="vaccination-ico"
            />Birth: ${date_of_birth || 'Not Available'}
          </li>
          <li>
            <img
              src="./assets/images/gender-ico.png"
              alt="vaccination-ico"
            />Gender: ${gender || 'Not Available'}
          </li>
          <li>
            <img
              src="./assets/images/dollar-ico.png"
              alt="vaccination-ico"
            />Price : ${price ? `${price}$` : 'Not Available'}
          </li>
          <li>
            <img
              src="./assets/images/vaccination-ico.png"
              alt="vaccination-ico"
            />Vaccinated status: ${vaccinated_status || 'Not Available'}
          </li>
        </ul>

        <hr class="my-4" />

        <h4 class="font-semibold">Details Information</h4>
        <ul class="list-disc text-gray-600 mt-2 leading-6">
        <p>
          ${pet_details || 'Not Available'}
        </p>
        </ul>

        <button
          id="modal-close"
          class="mt-4 btn-primary w-full py-2 bg-teal-100 text-teal-600 border-2 border-teal-200"
        >
          Cancel
        </button>
      </div>
      </br></br></br></br></br>
      </div>`

    Modal.open(detailsElem)

    const modalCloseBtn = document.getElementById('modal-close')
    modalCloseBtn.addEventListener('click', Modal.close)
  }
}

const waitFor = async (time) =>
  new Promise((resolve) => setTimeout(resolve, time))

const loadPets = async (pets) => {
  Loader.show()
  await waitFor(2000)
  Loader.hide()

  let petsElem = ''

  if (!pets.length) {
    petsElem = `<div
                class="bg-gray-100 w-full h-full col-span-full row-span-full flex flex-col text-center items-center gap-4 p-8 justify-center rounded-xl"
              >
                <figure>
                  <img
                    class="w-36"
                    src="./assets/images/error.webp"
                    alt="error"
                  />
                </figure>
                <h3 class="text-3xl font-bold">No Information Available</h3>
                <p class="text-gray-600">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                  The point of using Lorem Ipsum is that it has a.
                </p>
              </div>
            </div>`

    petList.innerHTML = petsElem
    return
  }

  for (const pet of pets) {
    const {
      breed,
      category,
      date_of_birth,
      gender,
      image,
      petId,
      pet_name,
      price,
    } = pet

    const card = `<div class="pet-card">
                <figure class="pet-banner">
                  <img src="${image}" alt="${category}" />
                </figure>

                <h1 class="mt-4 text-xl font-bold">${
                  pet_name || 'Not Available'
                }</h1>

                <ul class="pet-details-list">
                  <li>
                    <img src="./assets/images/breed-ico.png" alt="breed" />
                    Breed: ${breed || 'Not Available'}
                  </li>
                  <li>
                    <img
                      src="./assets/images/calender-ico.png"
                      alt="calender"
                    />
                    Birth: ${date_of_birth || 'Not Available'}
                  </li>
                  <li>
                    <img
                      src="./assets/images/gender-ico.png"
                      alt="gender-ico"
                    />
                    Gender: ${gender || 'Not Available'}
                  </li>
                  <li>
                    <img
                      src="./assets/images/dollar-ico.png"
                      alt="dollar-ico"
                    />
                    Price : ${price ? `${price}$` : 'Not Available'}
                  </li>
                </ul>

                <hr class="border-gray-200 mt-4" />

                <div class="pet-btn-groups">
                  <button name="like" class="pet-btn thumb">
                    <img
                      class="h-5 aspect-square"
                      src="./assets/images/thumbs-up.png"
                      alt="like"
                    />
                  </button>
                  <button name="adopt" class="pet-btn">Adopt</button>
                  <button name="details" class="pet-btn" data-id="${petId}">Details</button>
                </div>
              </div>`

    petsElem += card
  }

  petList.innerHTML = petsElem

  BtnClickHandlers.register()
}

const loadCategories = async () => {
  const categoriesContainer = document.getElementById('categories')

  let categoriesElem = ''

  const { categories } = await Api.getCategories()

  categories.forEach(({ category, category_icon }) => {
    const item = `<button class="categories__btn" data-category="${category.toLowerCase()}">
                <figure>
                  <img src="${category_icon}" alt="${category}" />
                </figure>
                <span> ${category} </span>
              </button>`
    categoriesElem += item
  })

  categoriesContainer.innerHTML = categoriesElem

  const { childNodes: categoryButtons } = categoriesContainer

  categoryButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      // remove active class from others
      categoryButtons.forEach((button) => {
        button.classList.remove('active')
      })

      e.currentTarget.classList.add('active')

      const pets = await Api.getPetsByCategory(
        e.currentTarget.getAttribute('data-category')
      )

      loadPets(pets)
    })
  })
}

const main = async () => {
  await loadCategories()

  try {
    const { pets } = await Api.getPets()
    loadPets(pets)
  } catch (error) {
    console.log(error.message)
  }

  const sortBtn = document.getElementById('sort-btn')
  sortBtn.addEventListener('click', async () => {
    Api.sortOrder = Api.sortOrder !== 'desc' ? 'desc' : 'asc'

    try {
      const pets = await Api.getPetsByPrice(Api.sortOrder)
      loadPets(pets)
    } catch (error) {
      console.log(error.message)
    }
  })
}

window.onload = main
