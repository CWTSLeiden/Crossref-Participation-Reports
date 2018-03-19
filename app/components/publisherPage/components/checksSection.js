import React, {Fragment} from 'react'
import is from 'prop-types'

import CheckBox from "./checkBox"
import ContentTypeFilter from "./contentTypeFilter"
import {prettyKeys, elipsize} from '../../../utilities/helpers'
import Search from "../../common/search"
import deployConfig from '../../../../deployConfig'







export default class ChecksSection extends React.Component {

  static propTypes = {
    coverage: is.object.isRequired,
    memberId: is.string.isRequired
  }


  state = {
    openTooltip: undefined,
    filter: 'Journal Article',
    titleFilter: undefined,
    titleSearchData: [],
    titleChecksData: undefined,
  }


  componentDidMount () {
    this.getSearchData()
  }


  setOpenTooltip = (selection) => {
    this.setState( prevState => prevState.openTooltip === selection ? null : {openTooltip: selection})
  }


  setFilter = (filter) => {
    this.setState({filter})
    this.getSearchData(filter)
  }


  getSearchData = (filter = this.state.filter) => {
    const translateFilter = {
      'Journal Article': 'Journal',
      'books': 'books'
    }

    return fetch(`https://apps.crossref.org/prep-staging/data?op=publications&memberid=${this.props.memberId}&contenttype=${filter}`)
      .then( r => r.json())
      .then( r => this.setState({titleSearchData: r.message}))
      .catch(e=>{
        console.error(e)
      })
  }


  selectTitle = (value, selection) => {
    this.setState({titleFilter: value})
    fetch(`https://apps.crossref.org/prep-staging/data?op=participation-summary&memberid=${this.props.memberId}&pubid=${value}`)
      .then( r => r.json())
      .then( r => this.setState({titleChecksData: r.message.Coverage}))
  }


  render () {
    const {filter, titleFilter, titleSearchData, titleChecksData} = this.state
    const {coverage} = this.props

    const mobile = window.matchMedia("(max-width: 639px)").matches

    return (
      <div className="checksSection">
        <div className="titleBar">
          {`Content type: ${prettyKeys(filter)}`}
        </div>


        <div className="filters">

          <ContentTypeFilter
            filters={Object.keys(coverage)}
            currentFilter={filter}
            setFilter={this.setFilter}
            inactive={!!titleFilter}
          />

          <div
            className={
              `filter publicationFilter ${
              titleFilter ? 'titleFilterActive' : ''} ${
              this.state.filter !== 'Journal Article' ? 'inactivePublicationFilter' : ''}`
            }>

            {titleFilter ?
              <Fragment>
                <div style={{maxWidth: '200px', maxHeight: '30px', overflow: 'hidden'}}>
                  {elipsize(titleFilter, 55)}
                </div>

                <img
                  className="titleFilterX"
                  src={`${deployConfig.baseUrl}assets/images/Asset_Icons_Black_Close.svg`}
                  onClick={()=>this.setState({titleFilter: undefined, titleChecksData: undefined})}/>
              </Fragment>
            :
              <Search
                searchData={titleSearchData}
                placeHolder="Search by Title"
                onSelect={this.selectTitle}
                listWidth={mobile ? 256 : 456}
                notFound="Not found in this content type"/>}
          </div>
          <div className="filter timeFilter">Last 12 months</div>
        </div>


        <div className="checksContainer">

          {(titleChecksData || coverage[filter] || []).map( item =>
            <CheckBox
              key={
                `${titleChecksData ? `${titleFilter}-` : ''
                }${filter ? `${filter}-` : ''
                }${item.name}`
              }
              item={item}
              openTooltip={this.state.openTooltip}
              setOpenTooltip={this.setOpenTooltip}/>
          )}

        </div>
      </div>
    )
  }
}