/**
 *
 * EditForm
 *
 */

import React from 'react';
import { findIndex, get, isEmpty, map } from 'lodash';
import PropTypes from 'prop-types';
import { InputsIndex as Input } from 'strapi-helper-plugin';
import Wrapper from './Wrapper';

class EditForm extends React.Component {
  getProviderForm = () =>
    get(
      this.props.settings,
      ['config'],
      {}
    );

  render() {
    console.log(this.props.settings)
    return (
      <Wrapper>
        <div className="subFormWrapper">
          <div className="row">
            {map(this.getProviderForm(), (value, key) => (
              <Input
                didCheckErrors={this.props.didCheckErrors}
                errors={get(this.props.formErrors, [
                  findIndex(this.props.formErrors, ['name', key]),
                  'errors',
                ])}
                key={key}
                label={{ id: `ctrip-apollo.${key}` }}
                name={key}
                onChange={this.props.onChange}
                type={'text'}
                validations={{ required: true }}
                value={get(this.props.modifiedData, key, '')}
              />
            ))}
          </div>
        </div>
      </Wrapper>
    );
  }
}

EditForm.defaultProps = {
  settings: {
    config: [],
  },
};

EditForm.propTypes = {
  didCheckErrors: PropTypes.bool.isRequired,
  formErrors: PropTypes.array.isRequired,
  modifiedData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  settings: PropTypes.object,
};

export default EditForm;
