import React from 'react'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { Spinner } from 'react-bootstrap'

function Help() {
  return (
    <div className='container'>
        <h1 style={{display:'flex', justifyContent:'center', alignItems:'center'}}>Help</h1>
        <div style={{display:'flex', flexDirection:'column'}}>
            <p style={{fontWeight:'bold'}}>1. Signing in</p>
            <p>The employee must first sign in.
                If the employee does not yet have an account, they must first select the Sign up link at the bottom and enter their desired email address and password for their account. 
                The employee must then wait for an administrative employee to login to the Auth0 tenant and assign a role to the new account
                 After the employee has been assigned a role, they can login using the aforementioned process without selecting the Sign up link. 
                 The signed in employee can then sign out or view their profile at any time by selecting their name in the navigation bar and selecting the given option. </p>
            <p style={{fontWeight:'bold'}}>2. Create Case</p>
            <p>After being assigned a role by an administrator and logging in, employees assigned the Customer Service role will see two options, View Cases and Create Case,
                 while all other employees will only see the View Cases button. Upon selecting the Create Case button, to create a case, the customer service employee must enter
                  the parent and child’s names and has the option to upload an initial comment and file with an optional file description as well as optional permissions for the comment
                   and file. The optional permissions will control which roles in the system will be able to view the comment and file when viewing the case. After selecting the Submit
                    button, the employee can return to the main menu or view the case by selecting the appropriate button. </p>
            <p style={{fontWeight:'bold'}}>3. View Case</p>
            <p>When selecting the View Cases button from the main menu, employees can view the basic details of every case in the system. Cases can be searched by child name by
                 entering the child’s name into the search box at the top and pressing enter or selecting the search button. To view a specific case, an employee can first select
                  the given case using the button on the far left of the given case, then selecting the View Case button. </p>
            <p style={{fontWeight:'bold'}}>4. Manage Case</p>   
            <p>From the View Case page, employees will see three different containers: a Case Details container, a Files container, and a Comments container. From the case details container,
                 employees with the Customer Service role can edit the child and parent’s name of the case using the Edit Case Details button and close or reopen the case using the Close Case button. 
                  employees can control the case state by selecting the Transition Case button, where the available transitions are restricted by user role and depend on the current case state.
                  When transitioning a case, the employee can optionally supply a comment and file with an optional file description and optional file and comment permissions which control 
                  which employee roles are able to view the comment and file. </p>
            <p style={{fontWeight:'bold'}}>5. Manage Case Files</p>
            <p>In the Files container, employees can view, upload, download, edit, and delete case files. Only files with permissions containing the user’s assigned role will be shown. 
                To view the details of a file, the employee can expand the file by expanding it. The employee can then download the file using the download button. If the employee is
                 the author of the file, they can edit or delete the file using the associated buttons. Employees can upload a new file using the New File button with an optional 
                 file description and optional file permissions that control which employee roles can view the file. </p>
            <p style={{fontWeight:'bold'}}>6. Manage Case Comments</p>
            <p>Employees can manage comments in the Comments container. Only comments with permissions containing the user’s assigned role will be listed. 
                To view the contents of a comment, it can be expanded by selecting it. If the user is the author of the comment, they can edit or delete it using the associated buttons.
                 Employees can create a new comment using the New Comment button with optional comment permissions that control which employee roles can view the comment. </p>   
        </div>
    </div>
  )
}

export default withAuthenticationRequired(Help, {
    onRedirecting: () => <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', paddingTop:'100px'}}><Spinner animation='border' role='status'></Spinner></div>,
  });