from AuthHelpers import AuthHelpers
from NewGeneration import Helpers
import random
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class ErrorCreateCategory(unittest.TestCase, Helpers, AuthHelpers):

    def setUp(self):
        self.driver = webdriver.Firefox()

    def delete_category(self):

        driver = self.driver
        category = driver.find_element_by_xpath('//*[@id="bs-example-navbar-collapse-1"]/ul[1]/li[1]/a').click()
        all_categories = driver.find_elements_by_class_name('category-link')
        for elem_categories in all_categories:
            elem_categories.click()
            list_product = driver.find_elements_by_class_name('.table-hover tbody>tr')
            print(list_product)





    def test_login_logout(self):


        mock_user = [
            {
                'driver': 'http://111.vippay.test',
                'email': '111',
                'password': '111'
            },
            {
                'driver': 'http://222.vippay.test',
                'email': '222',
                'password': '222'
            },
            {
                'driver': 'http://333.vippay.test',
                'email': '333',
                'password': '333'
            }
            ]

        for user in mock_user:

            driver = self.driver
            self.login(user)
            driver.implicitly_wait(5)
            category = driver.find_element_by_xpath('//*[@id="bs-example-navbar-collapse-1"]/ul[1]/li[1]/a')
            category.click()


            for i in xrange(2):
                self.delete_category()
            self.logout()


    def tearDown(self):
        self.driver.close()



if __name__ == '__main__':
    unittest.main()
