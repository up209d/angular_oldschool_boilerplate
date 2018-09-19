import templates from './upFile.template';

export default {
  template: () => {
    return templates[0];
  },
  bindings: {
    fileToUpload: '=?'
  },
  controller: [
    '$scope',
    '$element',
    '$attrs',
    '$timeout',
    upFileController
  ]
}

function upFileController($scope,$element,$attrs,$timeout) {
  let self = this;

  self.$postLink = () => {
    let inputFile = $element[0].querySelector('input');
    angular.element(inputFile).bind('change',function(e) {
      if (e.currentTarget.files[0]) {
        $scope.$apply(()=>{
          self.fileToUpload = inputFile.files[0];
          if ($attrs['onFileChange']) {
            $scope.$parent.$eval($attrs['onFileChange'],{
              $file: self.fileToUpload
            });
          }
        });
      }
    })
  }
}
