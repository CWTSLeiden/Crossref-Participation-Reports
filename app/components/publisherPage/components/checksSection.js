import React from 'react'
import is from 'prop-types'

import ContentTypeFilter from "./contentTypeFilter"







export default class ChecksSection extends React.Component {


  render () {
    console.log(this.props.coverage)

    return (
      <div className="checksSection">
        <div className="titleBar">
          Content type: Journal articles
        </div>


        <div className="filters">
          <ContentTypeFilter filters={Object.keys(this.props.coverage)}/>
          <div className="filter publicationFilter">Publication Filter</div>
          <div className="filter timeFilter">Last 12 months</div>
        </div>


        <div className="checksContainer">

          {(this.props.coverage['journal-articles'] || []).map(({name, percentage, info}) =>
            <div className="check" key={name}>
              <div className="title">{name}</div>

              <div className="barContainer">
                <div className="bar">
                  <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: "#3EB1CB"
                  }}/>
                </div>

                <div className="percent">{percentage}<span>%</span></div>
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }
}