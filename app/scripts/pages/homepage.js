import templates from './homepage.template';

export default {
  template: function() {
    return templates[0];
  },
  bindings: {

  },
  controller: [
    '$scope',
    upHomeController
  ]
};

function upHomeController($scope) {
  let self = this;
};
