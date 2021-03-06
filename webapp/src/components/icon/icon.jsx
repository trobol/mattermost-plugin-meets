// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyleFromTheme } from 'mattermost-redux/utils/theme_utils';

import { Svgs } from '../../constants';

export default class Icon extends React.PureComponent {
    static propTypes = {
        useSVG: PropTypes.bool.isRequired,
    }
    render() {
        const style = getStyle();

        let icon = (ariaLabel) => (
            <span aria-label={ariaLabel}>
                <i className='fa fa-video-camera' style={{
                        position: 'relative',
                        top: '-1px',
                    }}
                />
            </span>
        );
        if ( this.props.useSVG ) {
            icon = (ariaLabel) => (
                <span
                    aria-label={ariaLabel}
                    style={{
                        position: 'relative',
                        top: '-2.5px',
                    }}
                    dangerouslySetInnerHTML={{ __html: Svgs.VIDEO_CAMERA }}
                />
            );
        }
        return (
            <FormattedMessage
                id='meets.camera.ariaLabel'
                defaultMessage='meets camera icon'
            >
                {(ariaLabel) => icon(ariaLabel)}
            </FormattedMessage>
        );
    }
}

const getStyle = makeStyleFromTheme(() => {
    return {
        iconStyle: {
            position: 'relative',
            top: '-1px',
        },
    };
});
