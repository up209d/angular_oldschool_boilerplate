const templates = [
`
<div class="up-home">
  <div class="container">
    <div class="row">
      <div class="col-12 p-5">
        <h1 class="text-center">Hello World!</h1>
        <h5 class="text-center" ng-click="$root.dataService.test()">Again.From.Other.World</h5>
        <p  class="text-center">{{$root.dataService.state}}</p>
      </div>
    </div>
  </div>
</div>
`
]

export default templates;
