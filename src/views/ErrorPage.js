import VerticalLayout from './VerticalLayout.js'

export default (error) => {
  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Erreur </div>
        </div>
        <div data-testid="error-message">
          ${error ? error : ""}
        </div>
    </div>`
  )
}

/*
export default (error) => {

  let errMsg = "Une erreur est survenue.";

  const message = typeof error === "string"
    ? error
    : error?.message || "";  
    
  //console.log("In ErrorPage.js, error Message:",message);
  if (error && typeof error.message === "string") {
    if (error.message.includes("404")) {
      errMsg = "Erreur 404 - Ressource non trouvée.";
    } else if (error.message.includes("500")) {
      errMsg = "Erreur 500 - Erreur du serveur.";
    } else {
      errMsg = error.message;
    }
  } 
  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Erreur </div>
        </div>
        <div data-testid="error-message">
          ${errMsg}
        </div>
      </div>
    </div>
  `);
}
*/