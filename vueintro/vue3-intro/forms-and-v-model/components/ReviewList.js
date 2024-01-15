app.component('review-list', {
    props: {
      reviews: {
        type: Array,
        required: true
      }
    },
    template:
    /*html*/
    `
    <div class="review-container">
    <h3>Reviews:</h3>
      <ul>
        <li v-for="(review, index) in reviews" :key="index">
          {{ review.name }} gave {{ review.rating }} stars
          <br/>
          "{{ review.review }}"
          <br/>
          {{review.name}}:{{ review.reccomendation }} 
          <br>
        </li>
      </ul>
    </div>
  `
  })