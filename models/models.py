# -*- coding: utf-8 -*-

from odoo import models, fields, api


class _a_test_app(models.Model):
    _name = '_a_test_app._a_test_app'
    _description = '_a_test_app._a_test_app'

    name = fields.Char()
    value = fields.Integer()
    value2 = fields.Integer()

    description = fields.Text()

    @api.depends('value')
    def _value_pc(self):
        for record in self:
            record.value2 = float(record.value) / 100


    def get_map_data(self):
        return self.env['_a_test_app._a_test_app'].search_read([],['name','value','value2','description'])





    def update_vehicle_location(self , value, value2):
        vehicle = self.env['_a_test_app._a_test_app'].search([('name', '=', "fffff")], limit=1)

        if vehicle:
            try:
                vehicle.write({'value': value, 'value2': value2})
                self.env.cr.commit()
                print("Update Successful")
                return True
            except Exception as e:
                self.env.cr.rollback()
                print(e)
                return e
        else:
            return False
        
    def create_new_record(self, name, value, value2,description):
        new_record = self.env['_a_test_app._a_test_app'].create({
            'name': name,
            'value': value,
            'value2': value2,
            'description':description
        })
        return new_record
