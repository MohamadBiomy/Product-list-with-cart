// screen 
let thisScreen = ""

function getScreen() {
  // mobiles from 0px to 600px
  if (window.innerWidth >= 0 && window.innerWidth <= 600) {
    thisScreen = "mobile"
  } else if (window.innerWidth >= 601 && window.innerWidth <= 991) {  // tablets from 601px to 991px
    thisScreen = "tablet"
  } else if (window.innerWidth >= 992) {  // desktops from 992px and up
    thisScreen = "desktop"
  }
}
getScreen()
window.addEventListener("resize", getScreen)

// removing confirm message
let confirmMessage = document.querySelector(".confirm")
confirmMessage.remove()

// filling products container
const productsObj = {}
let productsContainer = document.querySelector(".products-container")
let numOfProducts = document.querySelector(".num-of-products")

let buttons = []
fetch("data.json").then(res => res.json())
.then(data => {
  // Adding data to page
  data.forEach((product, i) => {
    // some vars
    let prodName = product.name;
    let category = product.category;
    let price = product.price;
    let imgThumb = product.image.thumbnail
    productsObj[i] = {
      productName: prodName,
      productPrice: price,
      quantity: 0,
      totalPrice: function () {
        return this.quantity * +this.productPrice
      },
      thumbImg: imgThumb,
      index: i
    }
    let imageSrc = product.image[thisScreen]
    let prodDiv = document.createElement("div")
    prodDiv.className = "product"
    // image box
    let imageBox = document.createElement("div")
    imageBox.className = "image-box"
    // img
    let img = document.createElement("img")
    img.setAttribute("src", imageSrc)
    imageBox.append(img)
    // add to cart
    let addToCartDiv = document.createElement("div")
    addToCartDiv.className = "add-to-cart"
    addToCartDiv.dataset.product = prodName;
    buttons.push(addToCartDiv)
    // empty add to cart
    let emptyDiv = document.createElement("div")
    emptyDiv.className = "empty"
    emptyDiv.innerHTML = "Add to Cart"
    let cartImg = document.createElement("img")
    cartImg.setAttribute("src", "SVGs/icon-add-to-cart.png")
    emptyDiv.prepend(cartImg)
    addToCartDiv.append(emptyDiv)
    // filled add to cart
    let filleDiv = document.createElement("div")
    filleDiv.classList.add("filled")
    filleDiv.classList.add("none")
    // minus + plus
    let plus = document.createElement("div") 
    let minus = document.createElement("div") 
    let prodQuantity = document.createElement("div") 
    plus.className = "plus"
    plus.innerHTML = '<i class="fa-solid fa-plus"></i>'
    minus.className = "minus"
    minus.innerHTML = '<i class="fa-solid fa-minus"></i>'
    prodQuantity.className = "product-quantity"
    prodQuantity.innerHTML = "0"
    filleDiv.append(minus)
    filleDiv.append(prodQuantity)
    filleDiv.append(plus)
    addToCartDiv.append(filleDiv)
    imageBox.append(addToCartDiv)
    prodDiv.append(imageBox)
    // info box
    let infoDiv = document.createElement("div")
    infoDiv.className = "info"
    let nameDiv = document.createElement("div")
    nameDiv.className = "name"
    nameDiv.innerHTML = prodName
    let categoryDiv = document.createElement("div")
    categoryDiv.className = "category"
    categoryDiv.innerHTML = category
    let priceDiv = document.createElement("div")
    priceDiv.className = "price"
    priceDiv.innerHTML = `&dollar;${price}`
    infoDiv.append(categoryDiv)
    infoDiv.append(nameDiv)
    infoDiv.append(priceDiv)
    prodDiv.append(infoDiv)
    productsContainer.append(prodDiv)
  });
  // on clicking add to cart button
  let addCartBtns = document.querySelectorAll(".add-to-cart")
  addCartBtns.forEach((btn, i) => addCartBtnFunction(btn, i))
})


// confirming order
let confirmItems;
let confirmButton = document.querySelector("nav .buying-case button")
confirmButton.addEventListener("click", () => {
  // adding shadow to body
  document.body.classList.add("shadow")
  // adding confirm message to the container
  document.querySelector(".container").append(confirmMessage)
  // adding items 
  let itemsContainer = document.querySelector(".confirm .items-box")
  
  confirmItems.forEach(item => {
    
    let itemDiv = document.createElement("div")
    itemDiv.className = "bought-item"
    // info box
    let infoDiv = document.createElement("div")
    infoDiv.className = "info-box"
    infoDiv.innerHTML = `<img src="${item.thumbImg}" alt="">` // img
    // div after img
    let tempDiv = document.createElement("div")
    tempDiv.innerHTML = `<p>${item.productName}</p><span>${item.quantity}x</span><span>@&dollar;${item.productPrice}</span>`
    infoDiv.append(tempDiv)
    itemDiv.append(infoDiv)
    // total price
    let p = document.createElement("p")
    p.innerHTML = `&dollar;${item.totalPrice().toFixed(2)}`
    itemDiv.append(p)

    itemsContainer.append(itemDiv)

  })

  // adding total price
  let totalPrice = document.querySelector(".confirm .confirm-price p:last-child")
  totalPrice.append(getObjectTotal("price").toFixed(2))

  // new order button
  newOrder()

})


// functions

function addCartBtnFunction(button, index) {
  button.addEventListener("click", (e) => {
    // removing empty cart and adding filled cart
    button.children[0].classList.add("none")
    button.children[1].classList.remove("none")
    // increasing product quantity on click
    let prodQuantity = document.querySelectorAll(".product-quantity")[index]
    if (!button.classList.contains("clicked") && e.target.className !== "minus") {
      button.classList.add("clicked")
      productsObj[index].quantity++
      +prodQuantity.innerHTML++
      // add class full to the button
      button.parentElement.classList.add("full")
    }
    // plus + minus
    let plus = document.querySelectorAll(".plus")[index]
    let minus = document.querySelectorAll(".minus")[index]
    plus.onclick = function () {
      +prodQuantity.innerHTML++
      productsObj[index].quantity++
    }
    minus.onclick = function () {
      +prodQuantity.innerHTML--
      productsObj[index].quantity--
      if (+prodQuantity.innerHTML == 0) {
        button.classList.remove("clicked")
        button.parentElement.classList.remove("full")
      } 
    }
    fillOrderList()
  })
}

let emptyCart = document.querySelector("nav .empty-cart")
let allItemTotalQuantity = document.querySelector("nav > h2 .num-of-products")
let buyingCaseDiv = document.querySelector("nav .buying-case")
function fillOrderList() {
  if (getObjectTotal("quantity") > 0) {
    // adding buying div + removing empty cart
    emptyCart.classList.remove("none")
    buyingCaseDiv.classList.remove("none")
    emptyCart.classList.add("none")
    let boughtItems = [];
    // getting bought items 
    let arrayOfkeys = Object.keys(productsObj)
    for (let i = 0; i < arrayOfkeys.length; i++) {
      if (productsObj[i].quantity > 0) {
        boughtItems.push(productsObj[i])
      }
    }
    // sending bought items to confirm message
    confirmItems = boughtItems;
    // filling items list
    let boughtItemsDiv = document.querySelector(".bought-items")
    boughtItemsDiv.innerHTML = ""
    for (let i = 0; i < boughtItems.length; i++) {
      let itemDiv = document.createElement("div")
      itemDiv.className = "item"
      // item info
      let itemInfoDiv = document.createElement("div")
      itemInfoDiv.className = "item-info"
      // item name
      let itemNameDiv = document.createElement("div")
      itemNameDiv.className = "item-name"
      itemNameDiv.innerHTML = boughtItems[i].productName
      itemInfoDiv.append(itemNameDiv)
      // item value
      let itemValueDiv = document.createElement("div")
      itemValueDiv.className = "item-value"
      // item quantity
      let quantitySpan = document.createElement("span")
      quantitySpan.className = "item-quantity"
      quantitySpan.innerHTML = `${boughtItems[i].quantity}x`
      itemValueDiv.append(quantitySpan)
      // item price
      let priceSpan = document.createElement("span")
      priceSpan.className = "single-price"
      priceSpan.innerHTML = `@&dollar;${boughtItems[i].productPrice}`
      itemValueDiv.append(priceSpan)
      // item total price
      let totalPriceSpan = document.createElement("span")
      totalPriceSpan.className = "total-price"
      totalPriceSpan.innerHTML = `&dollar;${(boughtItems[i].totalPrice()).toFixed(2)}`
      itemValueDiv.append(totalPriceSpan)
      itemInfoDiv.append(itemValueDiv)
      itemDiv.append(itemInfoDiv)
      // remove button
      let removeDiv = document.createElement("div")
      removeDiv.className = "remove"
      removeDiv.innerHTML = '<i class="fa-solid fa-xmark"></i>'
      itemDiv.append(removeDiv)
      boughtItemsDiv.append(itemDiv)
      // clicking remove div 
      removeDiv.onclick = function () {
        boughtItems[i].quantity = 0
        let button = document.querySelector(`.add-to-cart[data-product="${boughtItems[i].productName}"]`)
        button.classList.remove("clicked")
        button.parentElement.classList.remove("full")
        button.children[1].children[1].innerHTML = 0
        fillOrderList()
      }
    }
    // total price filling
    let allItemTotalPrice = document.querySelector(".final-price span:last-child")
    allItemTotalPrice.innerHTML = `&dollar;${(getObjectTotal("price")).toFixed(2)}`
    // total quantity filling
    allItemTotalQuantity.innerHTML = getObjectTotal("quantity")
  } else {
    emptyCart.classList.remove("none")
    buyingCaseDiv.classList.add("none")
    allItemTotalQuantity.innerHTML = getObjectTotal("quantity")
  }
}

function getObjectTotal(prop) {

  if (prop === "price") {
    let result = 0;
    for (let n in productsObj) {
      result += +productsObj[n].totalPrice()
    }
    return result;
  } else {
    let result = 0;
    for (let n in productsObj) {
      result += +productsObj[n][prop]
    }
    return result;
  }

}

function newOrder() {
  let orderButton = document.querySelector(".confirm button")
  orderButton.addEventListener("click", () => location.reload())
}