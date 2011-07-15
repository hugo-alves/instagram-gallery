Feature: Viewing the Instagram Popular Gallery
  
  @javascript
  Scenario: Viewing with results
    Given the Instagram "popular" api returns 10 results
    When I go to the popular gallery page
    Then I should see 10 media objects
    When I click on a thumbnail
    Then I should an expanded thumbnail