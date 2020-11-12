function ProjectAccessComponent(){
    this.clientComponents = [];
}
ProjectAccessComponent.prototype.addClientComponent = function(clientComponent){
    this.clientComponents.push(clientComponent);
}
ProjectAccessComponent.prototype.loadAllClientDropdowns = function(data){
    if(data && this.clientComponents.length > 0){
        this.clientComponents.forEach(client => {
            client.loadClientDropdown(data);
        });
    }
}
ProjectAccessComponent.prototype.createAddClientDiv = function(){
    const addClientDiv = document.createElement('div');
    addClientDiv.classList.add('add-client');
    const addButton = document.createElement('i');
    addButton.classList.add('fa','fa-plus-circle','fa-lg','client-plus');
    addButton.onclick = handleClientPlusClickEvent;
    addButton.textContent = 'Client';
    addClientDiv.appendChild(addButton);
    return addClientDiv;
}
ProjectAccessComponent.prototype.createProjectAccessDiv = function(){
    const projectAccessDiv = document.createElement('div');
    projectAccessDiv.classList.add('project-access');
    return projectAccessDiv;
}

